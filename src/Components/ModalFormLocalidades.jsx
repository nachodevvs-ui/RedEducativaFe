import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { FaSave, FaTimes, FaBuilding, FaMapSigns } from "react-icons/fa";
import clientAxios from "../helpers/axios.helpers";
import COLORS from "../pages/ColoresHome";
import Swal from "sweetalert2";

const initialFormData = {
  nombre: "",
  es_comuna: false,
  id_departamento: "",
};

export default function ModalFormLocalidades({
  show,
  handleClose,
  onSave,
  onUpdate,
  localidadToEdit,
  departamentosData,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (localidadToEdit) {
      setFormData({
        nombre: localidadToEdit.nombre || "",
        es_comuna: !!localidadToEdit.es_comuna,
        id_departamento: localidadToEdit.id_departamento || "",
      });
    } else {
      setFormData(initialFormData);
    }
    setError(null);
  }, [localidadToEdit, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!formData.nombre || !formData.id_departamento) {
      setError("El nombre de la Localidad y el Departamento son obligatorios.");
      setIsSaving(false);
      return;
    }

    const isEditing = !!localidadToEdit;
    const url = isEditing
      ? `/localidades/${localidadToEdit.id_localidad}`
      : "/localidades";
    const method = isEditing ? clientAxios.put : clientAxios.post;

    try {
      const dataToSend = {
        ...formData,
        id_departamento: parseInt(formData.id_departamento),
      };

      const response = await method(url, dataToSend);

      if (isEditing) {
        onUpdate(response.data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Localidad actualizada",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        onSave(response.data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Localidad creada",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      handleClose();
    } catch (err) {
      console.error("Error al guardar la localidad:", err);
      setError(
        "Error al guardar. Verifica la conexión y que los datos sean correctos."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const modalTitle = localidadToEdit
    ? "Editar Localidad"
    : "Crear Nueva Localidad";

  const isLoadingDepartamentos =
    !departamentosData || departamentosData.length === 0;

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton style={{ borderBottom: `2px solid ${COLORS.textHeader}` }}>
        <Modal.Title className="fw-bold" style={{ color: COLORS.textHeader }}>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group controlId="formNombre">
                <Form.Label className="fw-semibold">
                  <FaBuilding className="me-1" /> Nombre de la Localidad
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group controlId="formEsComuna">
                <Form.Check
                  type="checkbox"
                  label="¿Es Comuna?"
                  name="es_comuna"
                  checked={formData.es_comuna}
                  onChange={handleChange}
                  className="fw-semibold"
                  style={{ color: COLORS.textPrimary }}
                />
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group controlId="formDepartamento">
                <Form.Label className="fw-semibold">
                  <FaMapSigns className="me-1" /> Departamento
                </Form.Label>
                <Form.Select
                  name="id_departamento"
                  value={formData.id_departamento}
                  onChange={handleChange}
                  required
                  disabled={isLoadingDepartamentos || isSaving}
                >
                  <option value="">
                    {isLoadingDepartamentos
                      ? "Cargando Departamentos..."
                      : "Seleccione un Departamento"}
                  </option>
                  {departamentosData.map((departamento) => (
                    <option
                      key={departamento.id_departamento}
                      value={departamento.id_departamento}
                    >
                      {departamento.id_departamento} - {departamento.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            <FaTimes className="me-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            style={{
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
            }}
            className="fw-bold"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {localidadToEdit ? "Guardar Cambios" : "Crear Localidad"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
