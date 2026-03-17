"use client";

import { useState } from "react";
import { Container, Form, Button, Row, Col, Card, Alert } from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import { useRouter } from 'next/navigation'; // For redirection

// Define question types
type QuestionType = "text" | "textarea" | "radio" | "checkbox";

// Define question structure
interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For radio and checkbox
  fixed?: boolean; // To mark fixed contact fields
}

export default function CreateFormPage() {
  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>("text");
  const [currentOptions, setCurrentOptions] = useState(""); // Comma-separated for radio/checkbox
  const router = useRouter();

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

    const formId = uuidv4();
    // Include fixed contact fields in the form definition
    const formDefinition = {
      id: formId, // Unique ID for the form
      title: formTitle.trim(),
      questions: [
        ...questions,
        { id: uuidv4(), text: "Nombre", type: "text", fixed: true },
        { id: uuidv4(), text: "Apellido", type: "text", fixed: true },
        { id: uuidv4(), text: "Email", type: "text", fixed: true },
        { id: uuidv4(), text: "Teléfono", type: "text", fixed: true },
      ],
    };

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDefinition),
      });

      if (response.ok) {
        alert("Formulario guardado exitosamente!");
        router.push(`/forms/${formId}`); // Redirect to the public form page
      } else {
        const errorData = await response.json();
        alert(`Error al guardar el formulario: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error al guardar el formulario:", error);
      alert("Ocurrió un error al intentar guardar el formulario.");
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="my-4">Crear Nuevo Formulario</h1>

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
          Guardar Formulario
        </Button>
      </Form>
    </Container>
  );
}
