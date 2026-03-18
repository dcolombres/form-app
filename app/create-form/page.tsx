"use client";

import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Tooltip, OverlayTrigger } from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import { useRouter } from 'next/navigation'; // For redirection
import { toast } from "sonner"; // For notifications
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faPlus, faTrash, faSave, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/context/AuthContext";

// Define question types
type QuestionType = "text" | "textarea" | "radio" | "checkbox" | "date";

// Define question structure
interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For radio and checkbox
  fixed?: boolean; // To mark fixed contact fields
}

export default function CreateFormPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>("text");
  const [currentOptions, setCurrentOptions] = useState(""); // Comma-separated for radio/checkbox

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, isLoading, router]);

  const handleAddQuestion = () => {
    if (!currentQuestionText.trim()) {
      toast.error("El texto de la pregunta no puede estar vacío.");
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
        toast.warning("Las preguntas de opción múltiple necesitan al menos dos opciones separadas por comas.");
        return;
      }
      newQuestion.options = optionsArray;
    }

    setQuestions([...questions, newQuestion]);
    setCurrentQuestionText("");
    setCurrentQuestionType("text");
    setCurrentOptions("");
    toast.success("Pregunta añadida correctamente.");
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.info("Pregunta eliminada.");
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      toast.error("El título del formulario no puede estar vacío.");
      return;
    }

    const formId = uuidv4();
    // Include fixed contact fields in the form definition
    const formDefinition = {
      id: formId, // Unique ID for the form
      title: formTitle.trim(),
      questions: [
        ...questions,
        { id: "fixed_name", text: "Nombre", type: "text", fixed: true },
        { id: "fixed_surname", text: "Apellido", type: "text", fixed: true },
        { id: "fixed_email", text: "Email", type: "text", fixed: true },
        { id: "fixed_phone", text: "Teléfono", type: "text", fixed: true },
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
        toast.success("¡Formulario guardado exitosamente!");
        router.push(`/forms/${formId}`); // Redirect to the public form page
      } else {
        const errorData = await response.json();
        toast.error(`Error al guardar: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error al guardar el formulario:", error);
      toast.error("Ocurrió un error al intentar guardar el formulario.");
    }
  };

  const renderHelpTooltip = (text: string) => (
    <Tooltip id="help-tooltip">
      {text}
    </Tooltip>
  );

  return (
    <Container className="mt-4 pb-5">
      <h1 className="my-4 d-flex align-items-center">
        Crear Nuevo Formulario
        <OverlayTrigger
          placement="right"
          overlay={renderHelpTooltip("Crea formularios personalizados añadiendo diferentes tipos de preguntas.")}
        >
          <span className="ms-2 fs-5 text-muted cursor-help">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </span>
        </OverlayTrigger>
      </h1>

      <Form>
        <Form.Group className="mb-4" controlId="formTitle">
          <Form.Label className="fw-bold d-flex align-items-center">
            Título del Formulario
            <OverlayTrigger
              placement="top"
              overlay={renderHelpTooltip("Este nombre aparecerá en la parte superior del formulario público.")}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-info" />
            </OverlayTrigger>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: Encuesta de Satisfacción del Cliente"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            size="lg"
          />
        </Form.Group>

        <Card className="bg-light border-0 mb-4 shadow-sm">
          <Card.Body>
            <h5 className="mb-3 text-primary d-flex align-items-center">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Añadir Nueva Pregunta
            </h5>
            <Row className="mb-3">
              <Col md={7}>
                <Form.Group controlId="questionText">
                  <Form.Label>Texto de la Pregunta</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Escribe tu pregunta aquí..."
                    value={currentQuestionText}
                    onChange={(e) => setCurrentQuestionText(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId="questionType">
                  <Form.Label className="d-flex align-items-center">
                    Tipo de Respuesta
                    <OverlayTrigger
                      placement="top"
                      overlay={renderHelpTooltip("Elige cómo quieres que los usuarios respondan.")}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} className="ms-1 text-info small" />
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Select
                    value={currentQuestionType}
                    onChange={(e) => setCurrentQuestionType(e.target.value as QuestionType)}
                  >
                    <option value="text">Texto Corto (Línea única)</option>
                    <option value="textarea">Párrafo (Múltiples líneas)</option>
                    <option value="radio">Opción Única (Botones de selección)</option>
                    <option value="checkbox">Opción Múltiple (Casillas de verificación)</option>
                    <option value="date">Fecha</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {(currentQuestionType === "radio" || currentQuestionType === "checkbox") && (
              <Form.Group className="mb-3" controlId="questionOptions">
                <Form.Label className="d-flex align-items-center">
                  Opciones
                  <OverlayTrigger
                    placement="top"
                    overlay={renderHelpTooltip("Escribe las opciones separadas por comas. Ejemplo: Rojo, Verde, Azul")}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="ms-1 text-info small" />
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Opción A, Opción B, Opción C"
                  value={currentOptions}
                  onChange={(e) => setCurrentOptions(e.target.value)}
                />
                <Form.Text className="text-muted">
                  <strong>Importante:</strong> Separa cada opción con una coma (,). Necesitas al menos 2 opciones.
                </Form.Text>
              </Form.Group>
            )}

            <Button variant="primary" onClick={handleAddQuestion} className="w-100 mt-2">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Añadir Pregunta al Listado
            </Button>
          </Card.Body>
        </Card>

        <h3 className="my-4 border-bottom pb-2 d-flex align-items-center">
          Vista Previa de Preguntas
          <span className="ms-auto badge bg-primary fs-6">{questions.length} preguntas</span>
        </h3>
        
        {questions.length === 0 ? (
          <Alert variant="info" className="text-center py-4 border-0 shadow-sm">
            <FontAwesomeIcon icon={faInfoCircle} size="2x" className="mb-3 text-info" />
            <p className="mb-0 fw-bold">Aún no has añadido ninguna pregunta personalizada.</p>
            <p className="small mb-0">Usa el panel superior para empezar a construir tu formulario.</p>
          </Alert>
        ) : (
          questions.map((q, index) => (
            <Card key={q.id} className="mb-3 shadow-sm border-start border-info border-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title className="h5">{index + 1}. {q.text}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Tipo: <span className="badge bg-secondary-subtle text-secondary border">{q.type}</span>
                    </Card.Subtitle>
                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 small">
                        <strong>Opciones:</strong> {q.options.map((opt, i) => (
                          <span key={i} className="badge bg-light text-dark border me-1">{opt}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="link"
                    className="text-danger p-0 ms-2"
                    title="Eliminar pregunta"
                    onClick={() => handleRemoveQuestion(q.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}

        <div className="my-5 p-4 border rounded bg-white shadow-sm">
          <h4 className="text-secondary border-bottom pb-2 mb-3 d-flex align-items-center">
            Campos Obligatorios de Contacto
            <OverlayTrigger
              placement="top"
              overlay={renderHelpTooltip("Estos campos se incluyen siempre para identificar a los encuestados.")}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-muted fs-6" />
            </OverlayTrigger>
          </h4>
          <p className="small text-muted mb-3">
            Por motivos de gestión y seguimiento, los siguientes campos se añaden automáticamente al final de cada formulario y no pueden ser eliminados:
          </p>
          <Row xs={1} md={2} lg={4} className="g-3">
            {["Nombre", "Apellido", "Email", "Teléfono"].map((field) => (
              <Col key={field}>
                <div className="p-2 border rounded text-center bg-light">
                  <span className="fw-bold">{field}</span>
                  <span className="text-danger ms-1">*</span>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div className="d-grid gap-2 mb-5">
          <Button variant="success" onClick={handleSaveForm} size="lg" className="py-3 shadow-sm">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Finalizar y Crear Formulario
          </Button>
          <Form.Text className="text-center text-muted">
            Al hacer clic, el formulario se guardará y podrás compartirlo inmediatamente.
          </Form.Text>
        </div>
      </Form>
    </Container>
  );
}
