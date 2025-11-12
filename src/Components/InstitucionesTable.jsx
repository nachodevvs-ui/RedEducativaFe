import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  InputGroup,
  Card,
} from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import COLORS from "../pages/ColoresHome";
import clientAxios from "../helpers/axios.helpers";
import ModalFormInstituciones from "./ModalFormInstituciones";

export default function InstitucionesTable() {
  const [instituciones, setInstituciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [institucionAEditar, setInstitucionAEditar] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const fetchInstituciones = async () => {
    setIsLoading(true);
    try {
      const { data } = await clientAxios.get("/instituciones");
      setInstituciones(data || []);
    } catch (error) {
      console.error("Error al obtener instituciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstituciones();
  }, [refreshFlag]);

  const handleShow = () => {
    setInstitucionAEditar(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setInstitucionAEditar(null);
  };

  const handleAddInstitucion = (newInst) => {
    setInstituciones((prev) => [...prev, newInst]);
    setRefreshFlag((prev) => !prev);
  };

  const handleEdit = (id) => {
    const inst = instituciones.find((i) => i.id_institucion === id);
    if (inst) {
      setInstitucionAEditar(inst);
      setShowModal(true);
    }
  };

  const handleUpdateInstitucion = () => {
    setRefreshFlag((prev) => !prev);
  };

  const handleDelete = async (id) => {
    try {
      await clientAxios.delete(`/instituciones/${id}`);
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      console.error("Error al eliminar institución:", error);
    }
  };

  const filteredInstituciones = instituciones.filter(
    (inst) =>
      (inst.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.departamento || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.contacto || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.id_localidad || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="min-vh-100 py-5" style={{ backgroundColor: COLORS.bgLight }}>
      <Container style={{ maxWidth: "1200px" }}>
        <Row className="mb-4 d-flex align-items-center">
          <Col md={8}>
            <h1 className="fw-bold mb-1" style={{ color: COLORS.textHeader }}>
              Gestión de Instituciones
            </h1>
            <p className="lead" style={{ color: COLORS.textSecondary }}>
              Administra las instituciones educativas del sistema
            </p>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Button
              onClick={handleShow}
              style={{
                backgroundColor: COLORS.textHeader,
                borderColor: COLORS.textHeader,
                color: COLORS.bgWhite,
                padding: "0.75rem 1.25rem",
              }}
              className="fw-bold shadow-sm"
            >
              <FaPlus className="me-2" />
              Agregar Institución
            </Button>
          </Col>
        </Row>

        <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <Card.Body className="p-4">
            <Row className="mb-4">
              <Col md={6}>
                <InputGroup className="shadow-sm border-0" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <InputGroup.Text style={{ backgroundColor: COLORS.bgWhite }}>
                    <FaSearch style={{ color: COLORS.textSecondary }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, departamento, contacto o localidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      backgroundColor: COLORS.bgWhite,
                      borderLeft: "none",
                      boxShadow: "none",
                    }}
                  />
                </InputGroup>
              </Col>
            </Row>

            <Table responsive hover borderless className="align-middle">
              <thead>
                <tr style={{ color: COLORS.textPrimary }}>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Departamento</th>
                  <th>Contacto</th>
                  <th>ID Localidad</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                      <p className="mt-2">Cargando datos...</p>
                    </td>
                  </tr>
                ) : filteredInstituciones.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No se encontraron instituciones.
                    </td>
                  </tr>
                ) : (
                  filteredInstituciones.map((inst) => (
                    <tr key={inst.id_institucion}>
                      <td className="fw-bold">{inst.id_institucion}</td>
                      <td>{inst.nombre}</td>
                      <td>{inst.departamento}</td>
                      <td>{inst.contacto}</td>
                      <td>{inst.id_localidad}</td>
                      <td className="text-center">
                        <Button variant="light" onClick={() => handleEdit(inst.id_institucion)} className="me-2">
                          <FaEdit />
                        </Button>
                        <Button variant="light" onClick={() => handleDelete(inst.id_institucion)}>
                          <FaTrashAlt style={{ color: COLORS.danger }} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <ModalFormInstituciones
        show={showModal}
        handleClose={handleClose}
        onSave={handleAddInstitucion}
        institucionToEdit={institucionAEditar}
        onUpdate={handleUpdateInstitucion}
      />
    </Container>
  );
}
