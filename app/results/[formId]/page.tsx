"use client";

import { useState, useEffect } from "react";
import { Container, Alert, Table, Button } from "react-bootstrap";
import { useParams } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  fixed?: boolean;
}

interface FormDefinition {
  id: string;
  title: string;
  questions: Question[];
}

interface FormResponse {
  [questionId: string]: any;
}

export default function ResultsPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form definition
        const formRes = await fetch(`/api/forms/${formId}`);
        if (!formRes.ok) {
          throw new Error(`Error fetching form definition: ${formRes.statusText}`);
        }
        const formDef: FormDefinition = await formRes.json();
        setFormDefinition(formDef);

        // Fetch responses
        const responsesRes = await fetch(`/api/forms/${formId}/responses`);
        if (!responsesRes.ok) {
          throw new Error(`Error fetching responses: ${responsesRes.statusText}`);
        }
        const fetchedResponses: FormResponse[] = await responsesRes.json();
        setResponses(fetchedResponses);

      } catch (e: any) {
        setError(e.message || "Error al cargar los resultados.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchData();
    }
  }, [formId]);

  const exportToCsv = () => {
    if (!formDefinition || responses.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Get all unique question IDs from form definition and responses
    const allQuestionIds = new Set<string>();
    formDefinition.questions.forEach(q => allQuestionIds.add(q.id));
    responses.forEach(res => {
      Object.keys(res).forEach(key => allQuestionIds.add(key));
    });

    // Create header row using question texts
    const headers = Array.from(allQuestionIds).map(id => {
      const question = formDefinition.questions.find(q => q.id === id);
      return question ? question.text : id; // Use question text if found, otherwise ID
    });

    const csvRows = [];
    csvRows.push(headers.join(',')); // Add header row

    responses.forEach(res => {
      const row = Array.from(allQuestionIds).map(id => {
        let value = res[id];
        if (Array.isArray(value)) {
          value = value.join(';'); // Join checkbox values with semicolon
        }
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || ''; // Handle undefined/null values
      });
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${formDefinition.title}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <p>Cargando resultados...</p>
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

  // Prepare table headers
  const tableHeaders = formDefinition.questions.map(q => q.text);

  return (
    <Container className="mt-4">
      <h1 className="my-4">Resultados: {formDefinition.title}</h1>
      <p className="mb-4 text-muted">ID del Formulario: {formId}</p>

      {responses.length === 0 ? (
        <Alert variant="info">Aún no hay respuestas para este formulario.</Alert>
      ) : (
        <>
          <Button variant="success" onClick={exportToCsv} className="mb-3">
            Exportar a CSV
          </Button>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {tableHeaders.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((response, rowIndex) => (
                <tr key={rowIndex}>
                  {formDefinition.questions.map((question) => (
                    <td key={question.id}>
                      {Array.isArray(response[question.id])
                        ? response[question.id].join(', ')
                        : response[question.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}
