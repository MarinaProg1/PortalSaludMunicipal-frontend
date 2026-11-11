import { Link } from "react-router-dom";
import { Card, Col, Container, Row } from "react-bootstrap";
import { BsHeartPulse, BsHouseDoor } from "react-icons/bs";

const NotFound = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Col xs={12} md={8} lg={6}>
                    <Card className="border-0 shadow-sm text-center bg-white" style={{ borderRadius: '16px' }}>
                        <Card.Body className="p-4 p-md-5">
                            
                            {/* Icono animado o destacado con el color institucional */}
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(0, 172, 178, 0.1)' }}>
                                <BsHeartPulse size={40} style={{ color: '#00ACB2' }} />
                            </div>

                            {/* Código 404 con estilo limpio */}
                            <h1 className="display-4 fw-bold text-dark mb-2" style={{ letterSpacing: '1px' }}>
                                404
                            </h1>

                            <Card.Title as="h2" className="h4 fw-semibold text-dark mb-3">
                                ¡Vaya! Nos perdimos en el consultorio
                            </Card.Title>

                            <Card.Text className="text-muted mb-4 px-md-3">
                                La página que estás buscando no existe, fue movida o el enlace es incorrecto. Pero no te preocupes, volvamos a la recepción.
                            </Card.Text>

                            {/* Botón con el color institucional y border-radius armónico */}
                            <Link 
                                to="/turnos" 
                                className="btn text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm px-4 py-2"
                                style={{ backgroundColor: '#00ACB2', borderRadius: '10px' }}
                            >
                                <BsHouseDoor size={18} />
                                Volver al Panel Principal
                            </Link>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;