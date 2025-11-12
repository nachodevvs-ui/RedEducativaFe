import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import clientAxios from "../helpers/axios.helpers";

export default function ModalFormInstituciones({
  show,
  handleClose,
  onSave,
  institucionToEdit,
  onUpdate,
}) {
  const isEditing = !!institucionToEdit;
  const [institucion, setInstitucion] = useState({
    nombre: "",
    personaACargo: "",  
    contacto: "",
    idLocalidad: "", 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      if (isEditing) {
        setInstitucion({
          nombre: institucionToEdit.nombre || "",
          personaACargo: institucionToEdit.personaACargo || "",
          contacto: institucionToEdit.contacto || "",
          idLocalidad: institucionToEdit.idLocalidad || "",
        });
      } else {
        setInstitucion({ nombre: "", personaACargo:+"", contacto: "", idLocalidad: "" });
      }
    }
  }, [show, isEditing, institucionToEdit]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInstitucion({ ...institucion, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await clientAxios.put(`/instituciones/${institucionToEdit.id_institucion}`, institucion);
        if (onUpdate) onUpdate(response.data);
      } else {
        response = await clientAxios.post("/instituciones", institucion);
        if (onSave) onSave(response.data);
      }
      handleClose();
    } catch (error) {
      console.error("Error al guardar institución:", error);
      alert("Error al guardar institución");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="bg-light text-dark border-0">
        <Modal.Title>
          {isEditing ? `✏️ Editar Institución: ${institucionToEdit?.nombre}` : "➕ Crear Nueva Institución"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light text-dark">
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3" controlId="nombre">
            <Form.Label column sm="3">Nombre</Form.Label>
            <Col sm="9">
              <Form.Control
                type="text"
                placeholder="Ej: Escuela Nº 5"
                value={institucion.nombre}
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="departamento">
            <Form.Label column sm="3">Departamento</Form.Label>
            <Col sm="9">
              <Form.Control
                type="text"
                placeholder="Ej: Lavalle"
                value={institucion.personaACargo}
                onChange={handleChange}
               
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="contacto">
            <Form.Label column sm="3">Contacto</Form.Label>
            <Col sm="9">
              <Form.Control
                type="text"
                placeholder="Nombre de la persona a cargo"
                value={institucion.contacto}
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="id_localidad">
            <Form.Label column sm="3">ID Localidad</Form.Label>
            <Col sm="9">
              <Form.Control
                type="text"
                placeholder="Ej: 123"
                value={institucion.id_localidad}
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>

          <div className="d-flex justify-content-end pt-3">
            <Button variant="secondary" onClick={handleClose} className="me-2" disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar Institución"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
