"use client";

import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // Import useParams

// Define question types
type QuestionType = "text" | "textarea" | "radio" | "checkbox";

// Define question structure
interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  fixed?: boolean;
}

interface FormDefinition {
  id: string;
  title: string;
  questions: Question[];
  createdAt?: string;
}

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string; // Get formId from URL

  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>("text");
  const [currentOptions, setCurrentOptions] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch form data on component mount
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FormDefinition = await response.json();
        setFormTitle(data.title);
        // Filter out fixed fields for editing, they will be re-added on save
        setQuestions(data.questions.filter(q => !q.fixed));
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

  const handleAddQuestion = () => {
    if (!currentQuestionText.trim()) {
      alert("El texto de la pregunta no puede estar vacío.");
      return;
    }

    const newQuestion: Question = {
      id: uuidv4(),
      text: currentQuestionText.trim(),
      type: currentQuestionType,
    };

    if (currentQuestionType === "radio" || currentQuestionType === "checkbox") {
      const optionsArray = currentOptions.split(",").map((opt) => opt.trim()).filter(Boolean);
      if (optionsArray.length < 2) {
        alert("Las preguntas de opción múltiple o casillas de verificación necesitan al menos dos opciones.");
        return;
      }
      newQuestion.options = optionsArray;
    }

    setQuestions([...questions, newQuestion]);
    setCurrentQuestionText("");
    setCurrentQuestionType("text");
    setCurrentOptions("");
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      alert("El título del formulario no puede estar vacío.");
      return;
    }

    // Re-add fixed contact fields before saving
    const fixedContactFields: Question[] = [
      { id: uuidv4(), text: "Nombre", type: "text", fixed: true },
      { id: uuidv4(), text: "Apellido", type: "text", fixed: true },
      { id: uuidv4(), text: "Email", type: "text", fixed: true },
      { id: uuidv4(), text: "Teléfono", type: "text", fixed: true },
    ];

    const formDefinition = {
      id: formId,
      title: formTitle.trim(),
      questions: [...questions, ...fixedContactFields],
    };

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT', // Use PUT for updating
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDefinition),
      });

      if (response.ok) {
        alert("Formulario actualizado exitosamente!");
        router.push(`/forms/${formId}`); // Redirect to the public form page
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar el formulario: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error al actualizar el formulario:", error);
      alert("Ocurrió un error al intentar actualizar el formulario.");
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando formulario...</span>
        </Spinner>
        <p className="mt-2">Cargando formulario para editar...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">
          <h4>Error al cargar el formulario</h4>
          <p>{error}</p>
          <Button onClick={() => router.back()} variant="danger">Volver</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="my-4">Editar Formulario</h1>

      <Form>
        <Form.Group className="mb-3" controlId="formTitle">
          <Form.Label>Título del Formulario</Form.Label>
          <Form.Control
            type="text"
            placeholder="Introduce el título de tu formulario"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
        </Form.Group>

        <h2 className="my-4">Añadir Pregunta</h2>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="questionText">
              <Form.Label>Texto de la Pregunta</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: ¿Cuál es tu color favorito?"
                value={currentQuestionText}
                onChange={(e) => setCurrentQuestionText(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="questionType">
              <Form.Label>Tipo de Pregunta</Form.Label>
              <Form.Select
                value={currentQuestionType}
                onChange={(e) => setCurrentQuestionType(e.target.value as QuestionType)}
              >
                <option value="text">Texto Corto</option>
                <option value="textarea">Párrafo</option>
                <option value="radio">Opción Múltiple (una respuesta)</option>
                <option value="checkbox">Casillas de Verificación (múltiples respuestas)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {(currentQuestionType === "radio" || currentQuestionType === "checkbox") && (
          <Form.Group className="mb-3" controlId="questionOptions">
            <Form.Label>Opciones (separadas por comas)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Opción 1, Opción 2, Opción 3"
              value={currentOptions}
              onChange={(e) => setCurrentOptions(e.target.value)}
            />
            <Form.Text className="text-muted">
              Introduce las opciones separadas por comas.
            </Form.Text>
          </Form.Group>
        )}

        <Button variant="info" onClick={handleAddQuestion} className="mb-4">
          Añadir Pregunta
        </Button>

        <h2 className="my-4">Preguntas del Formulario</h2>
        {questions.length === 0 ? (
          <Alert variant="secondary">Aún no has añadido ninguna pregunta.</Alert>
        ) : (
          questions.map((q, index) => (
            <Card key={q.id} className="mb-2">
              <Card.Body>
                <Card.Title>{index + 1}. {q.text}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Tipo: {q.type}</Card.Subtitle>
                {q.options && q.options.length > 0 && (
                  <div>
                    <strong>Opciones:</strong> {q.options.join(", ")}
                  </div>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="mt-2"
                >
                  Eliminar
                </Button>
              </Card.Body>
            </Card>
          ))
        )}

        <h2 className="my-4">Campos de Contacto Fijos</h2>
        <Alert variant="light">
          Los siguientes campos se incluirán automáticamente en tu formulario:
          <ul>
            <li>Nombre</li>
            <li>Apellido</li>
            <li>Email</li>
            <li>Teléfono</li>
          </ul>
        </Alert>

        <Button variant="success" onClick={handleSaveForm} className="mt-4">
          Guardar Cambios
        </Button>
      </Form>
    </Container>
  );
}
