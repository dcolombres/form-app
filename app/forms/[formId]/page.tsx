"use client";

import { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, InputGroup } from "react-bootstrap"; // Added InputGroup
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  text: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "date"; // Updated QuestionType
  options?: string[];
  fixed?: boolean;
}

interface FormDefinition {
  id: string;
  title: string;
  questions: Question[];
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("Copiar URL"); // State for copy button text

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FormDefinition = await response.json();
        setFormDefinition(data);

        // Initialize formData with empty values
        const initialFormData: { [key: string]: any } = {};
        data.questions.forEach(q => {
          if (q.type === 'checkbox') {
            initialFormData[q.id] = []; // Array for checkboxes
          } else {
            initialFormData[q.id] = '';
          }
        });
        setFormData(initialFormData);

      } catch (e: any) {
        setError(e.message || "Error al cargar el formulario.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleChange = (questionId: string, value: any, type: string) => {
    if (type === 'checkbox') {
      setFormData(prev => {
        const currentValues = prev[questionId] || [];
        if (currentValues.includes(value)) {
          return { ...prev, [questionId]: currentValues.filter((item: any) => item !== value) };
        } else {
          return { ...prev, [questionId]: [...currentValues, value] };
        }
      });
    } else {
      setFormData(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus(null);

    // Basic validation (e.g., check if required fields are filled)
    // For now, we'll just check if fixed contact fields are not empty
    const requiredFixedFields = formDefinition?.questions.filter(q => q.fixed);
    let isValid = true;
    requiredFixedFields?.forEach(q => {
      if (!formData[q.id] || (Array.isArray(formData[q.id]) && formData[q.id].length === 0)) {
        isValid = false;
      }
    });

    if (!isValid) {
      setSubmissionStatus("Por favor, completa todos los campos de contacto.");
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}/submit`, { // New API route for submission
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formId, responses: formData }),
      });

      if (response.ok) {
        setSubmissionStatus("¡Formulario enviado exitosamente! Gracias.");
        // Re-initialize formData based on formDefinition
        const initialFormData: { [key: string]: any } = {};
        formDefinition.questions.forEach(q => {
          if (q.type === 'checkbox') {
            initialFormData[q.id] = []; // Array for checkboxes
          } else {
            initialFormData[q.id] = '';
          }
        });
        setFormData(initialFormData); // Clear form with correct structure
      } else {
        const errorData = await response.json();
        setSubmissionStatus(`Error al enviar el formulario: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setSubmissionStatus("Ocurrió un error al intentar enviar el formulario.");
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus("Copiado!");
      setTimeout(() => setCopyStatus("Copiar URL"), 2000); // Reset text after 2 seconds
    }).catch(() => {
      setCopyStatus("Error al copiar");
      setTimeout(() => setCopyStatus("Copiar URL"), 2000);
    });
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <p>Cargando formulario...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  if (!formDefinition) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Formulario no encontrado.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="my-4">{formDefinition.title}</h1>
      <p className="mb-4 text-muted">ID del Formulario: {formId}</p>

      <Form.Group className="mb-4">
        <Form.Label>URL para compartir este formulario:</Form.Label>
        <InputGroup>
          <Form.Control
            type="text"
            value={window.location.href}
            readOnly
            onClick={(e: any) => e.target.select()} // Select text on click
          />
          <Button variant="outline-secondary" onClick={handleCopyUrl}>
            {copyStatus}
          </Button>
        </InputGroup>
      </Form.Group>

      {submissionStatus && (
        <Alert variant={submissionStatus.includes("exitosamente") ? "success" : "danger"}>
          {submissionStatus}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {formDefinition.questions.map((question) => (
          <Form.Group className="mb-3" controlId={question.id} key={question.id}>
            <Form.Label>{question.text} {question.fixed && <span className="text-danger">*</span>}</Form.Label>
            {question.type === "text" && (
              <Form.Control
                type="text"
                value={formData[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value, question.type)}
                required={question.fixed}
              />
            )}
            {question.type === "textarea" && (
              <Form.Control
                as="textarea"
                rows={3}
                value={formData[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value, question.type)}
                required={question.fixed}
              />
            )}
            {question.type === "radio" && (
              <div>
                {question.options?.map((option) => (
                  <Form.Check
                    key={option}
                    type="radio"
                    id={`${question.id}-${option}`}
                    label={option}
                    name={question.id}
                    value={option}
                    checked={formData[question.id] === option}
                    onChange={(e) => handleChange(question.id, e.target.value, question.type)}
                    required={question.fixed}
                  />
                ))}
              </div>
            )}
            {question.type === "checkbox" && (
              <div>
                {question.options?.map((option) => (
                  <Form.Check
                    key={option}
                    type="checkbox"
                    id={`${question.id}-${option}`}
                    label={option}
                    name={question.id}
                    value={option}
                  />
                ))}
              </div>
            )}
            {question.type === "date" && (
              <Form.Control
                type="date"
                value={formData[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value, question.type)}
                required={question.fixed}
              />
            )}
          </Form.Group>
        ))}

        <Button variant="primary" type="submit" className="mt-4">
          Enviar Formulario
        </Button>
      </Form>
    </Container>
  );
}
