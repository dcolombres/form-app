"use client";

import { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, InputGroup, Tooltip, OverlayTrigger } from "react-bootstrap";
import { useParams } from 'next/navigation';
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface Question {
  id: string;
  text: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "date";
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
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const initialFormData: Record<string, string | string[]> = {};
        data.questions.forEach(q => {
          if (q.type === 'checkbox') {
            initialFormData[q.id] = [];
          } else {
            initialFormData[q.id] = '';
          }
        });
        setFormData(initialFormData);

      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al cargar el formulario.");
        toast.error("No se pudo cargar el formulario.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleChange = (questionId: string, value: string, type: string) => {
    if (type === 'checkbox') {
      setFormData(prev => {
        const currentValues = (prev[questionId] as string[]) || [];
        if (currentValues.includes(value)) {
          return { ...prev, [questionId]: currentValues.filter((item: string) => item !== value) };
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
    setIsSubmitting(true);

    const requiredFixedFields = formDefinition?.questions.filter(q => q.fixed);
    let isValid = true;
    requiredFixedFields?.forEach(q => {
      const value = formData[q.id];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast.warning("Por favor, completa todos los campos de contacto obligatorios.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formId, responses: formData }),
      });

      if (response.ok) {
        toast.success("¡Formulario enviado exitosamente! Gracias por tu tiempo.");
        // Re-initialize formData
        const initialFormData: Record<string, string | string[]> = {};
        formDefinition!.questions.forEach(q => {
          if (q.type === 'checkbox') {
            initialFormData[q.id] = [];
          } else {
            initialFormData[q.id] = '';
          }
        });
        setFormData(initialFormData);
      } else {
        const errorData = await response.json();
        toast.error(`Error al enviar: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Ocurrió un error al intentar enviar el formulario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Enlace copiado al portapapeles");
    }).catch(() => {
      toast.error("No se pudo copiar el enlace");
    });
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando formulario...</p>
      </Container>
    );
  }

  if (error || !formDefinition) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || "Formulario no encontrado."}</p>
          <hr />
          <Button variant="outline-danger" onClick={() => window.location.reload()}>Reintentar</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 pb-5">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <h1 className="mb-2">{formDefinition.title}</h1>
          <p className="text-muted small mb-0">ID: {formId}</p>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4 bg-light">
        <Card.Body>
          <Form.Label className="fw-bold">Comparte este formulario:</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              value={typeof window !== 'undefined' ? window.location.href : ''}
              readOnly
              className="bg-white"
            />
            <Button variant="primary" onClick={handleCopyUrl}>
              <FontAwesomeIcon icon={faCopy} className="me-2" />
              Copiar Enlace
            </Button>
          </InputGroup>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
        {formDefinition.questions.map((question) => (
          <Form.Group className="mb-4" controlId={question.id} key={question.id}>
            <Form.Label className="fw-bold d-flex align-items-center">
              {question.text}
              {question.fixed && (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Este campo es obligatorio</Tooltip>}
                >
                  <span className="text-danger ms-1" style={{ cursor: 'help' }}>*</span>
                </OverlayTrigger>
              )}
            </Form.Label>
            
            {question.type === "text" && (
              <Form.Control
                type="text"
                placeholder="Tu respuesta..."
                value={formData[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value, question.type)}
                required={question.fixed}
              />
            )}
            
            {question.type === "textarea" && (
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Escribe aquí tu respuesta detallada..."
                value={formData[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value, question.type)}
                required={question.fixed}
              />
            )}
            
            {question.type === "radio" && (
              <div className="mt-2">
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
                    className="mb-2"
                  />
                ))}
              </div>
            )}
            
            {question.type === "checkbox" && (
              <div className="mt-2">
                {question.options?.map((option) => (
                  <Form.Check
                    key={option}
                    type="checkbox"
                    id={`${question.id}-${option}`}
                    label={option}
                    name={question.id}
                    value={option}
                    checked={formData[question.id]?.includes(option)}
                    onChange={(e) => handleChange(question.id, e.target.value, question.type)}
                    className="mb-2"
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

        <div className="d-grid gap-2 mt-5">
          <Button variant="success" type="submit" size="lg" disabled={isSubmitting} className="py-3">
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
            {isSubmitting ? "Enviando..." : "Enviar Formulario"}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
