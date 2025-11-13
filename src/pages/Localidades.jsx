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
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding,
} from "react-icons/fa";
import COLORS from "./ColoresHome";
import clientAxios from "../helpers/axios.helpers";
import ModalFormLocalidades from "../Components/ModalFormLocalidades";

const getLocalidades = async () => {
  try {
    const { data } = await clientAxios.get("/localidades");
    return data || [];
  } catch (error) {
    console.error("Error al obtener localidades:", error);
    return [];
  }
};

const getDepartamentos = async () => {
  try {
    const { data } = await clientAxios.get("/departamentos");
    return data || [];
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return [];
  }
};

const getLocalidadesConDepartamento = (localidadesData, departamentosData) => {
  const departamentosMap = departamentosData.reduce((map, dep) => {
    map[dep.id_departamento] = dep.nombre;
    return map;
  }, {});
  return localidadesData.map((loc) => ({
    ...loc,
    nombre_departamento: departamentosMap[loc.id_departamento] || "Departamento No Asignado",
    es_comuna: !!loc.es_comuna,
  }));
};

export default function LocalidadesPage() {
  const [localidades, setLocalidades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [departamentosData, setDepartamentosData] = useState([]);
  const [localidadAEditar, setLocalidadAEditar] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [localidadesList, departamentosList] = await Promise.all([
          getLocalidades(),
          getDepartamentos(),
        ]);
        setDepartamentosData(departamentosList);
        setLocalidades(getLocalidadesConDepartamento(localidadesList, departamentosList));
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShow = () => {
    setLocalidadAEditar(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setLocalidadAEditar(null);
  };

  const handleAddLocalidad = (newLocalidad) => {
    const nombreDepartamento =
      departamentosData.find((d) => d.id_departamento === newLocalidad.id_departamento)
        ?.nombre || "Departamento No Asignado";

    setLocalidades((prev) => [
      ...prev,
      { ...newLocalidad, nombre_departamento, es_comuna: !!newLocalidad.es_comuna },
    ]);
  };

  const handleUpdateLocalidad = (updatedLocalidad) => {
    setLocalidades((prev) =>
      prev.map((loc) =>
        loc.id_localidad === updatedLocalidad.id_localidad ? updatedLocalidad : loc
      )
    );
  };

  const handleEdit = (localidadId) => {
    const loc = localidades.find((l) => l.id_localidad === localidadId);
    if (loc) {
      setLocalidadAEditar(loc);
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Seguro de eliminar la Localidad ID ${id}?`)) return;
    try {
      await clientAxios.delete(`/localidades/${id}`);
      setLocalidades((prev) => prev.filter((loc) => loc.id_localidad !== id));
      alert("Localidad eliminada con éxito.");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la localidad.");
    }
  };

  const filteredLocalidades = localidades.filter(
    (loc) =>
      loc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.nombre_departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid style={{ backgroundColor: COLORS.bgLight }} className="min-vh-100 py-5">
      <Container style={{ maxWidth: "1200px" }}>
        <Row className="mb-4 d-flex align-items-center">
          <Col md={8}>
            <h1 className="fw-bold mb-1" style={{ color: COLORS.textHeader }}>
              Gestión de Localidades 🏙️
            </h1>
            <p className="lead" style={{ color: COLORS.textSecondary }}>
              Administra las localidades y sus departamentos asignados
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
              Agregar Localidad
            </Button>
          </Col>
        </Row>

        <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <Card.Body className="p-4">
            <Row className="mb-4">
              <Col md={6}>
                <InputGroup className="shadow-sm border-0" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <InputGroup.Text style={{ backgroundColor: COLORS.bgWhite, borderColor: COLORS.bgLight, borderRight: "none" }}>
                    <FaSearch style={{ color: COLORS.textSecondary }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre de localidad o departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ backgroundColor: COLORS.bgWhite, borderColor: COLORS.bgLight, borderLeft: "none", boxShadow: "none" }}
                  />
                </InputGroup>
              </Col>
            </Row>

            <Table responsive hover borderless className="align-middle">
              <thead>
                <tr style={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.bgLight}` }}>
                  <th>ID</th>
                  <th>Nombre Localidad</th>
                  <th>Departamento Asignado</th>
                  <th className="text-center">Es Comuna</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLocalidades.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4" style={{ color: COLORS.textSecondary }}>
                      No se encontraron localidades.
                    </td>
                  </tr>
                ) : (
                  filteredLocalidades.map((loc) => (
                    <tr key={loc.id_localidad} style={{ borderBottom: `1px solid ${COLORS.bgLight}` }}>
                      <td className="fw-bold" style={{ color: COLORS.textPrimary }}>{loc.id_localidad}</td>
                      <td className="fw-bold" style={{ color: COLORS.textPrimary }}>
                        <FaBuilding size={12} className="me-2" style={{ color: COLORS.textSecondary }} />
                        {loc.nombre}
                      </td>
                      <td style={{ color: COLORS.textSecondary }}><span className="fw-semibold">{loc.nombre_departamento}</span></td>
                      <td className="text-center">
                        {loc.es_comuna ? <FaCheckCircle style={{ color: COLORS.success }} title="Es Comuna" /> : <FaTimesCircle style={{ color: COLORS.danger }} title="No es Comuna" />}
                      </td>
                      <td className="text-center">
                        <Button variant="light" onClick={() => handleEdit(loc.id_localidad)} className="me-2" style={{ color: COLORS.primary }}><FaEdit /></Button>
                        <Button variant="light" onClick={() => handleDelete(loc.id_localidad)} style={{ color: COLORS.danger }}><FaTrashAlt /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <ModalFormLocalidades
        show={showModal}
        handleClose={handleClose}
        onSave={handleAddLocalidad}
        onUpdate={handleUpdateLocalidad}
        localidadToEdit={localidadAEditar}
        departamentosData={departamentosData}
      />
    </Container>
  );
}
