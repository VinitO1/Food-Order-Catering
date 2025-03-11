import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import supabase from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Catering.css';

const CateringPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cateringRestaurants, setCateringRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');

    const [formData, setFormData] = useState({
        event_name: '',
        event_date: '',
        event_time: '',
        num_guests: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: user?.email || '',
        occasion: '',
        dietary_restrictions: '',
        additional_notes: ''
    });

    useEffect(() => {
        fetchCateringRestaurants();
        testSupabaseConnection();
    }, []);

    const fetchCateringRestaurants = async () => {
        try {
            setLoading(true);

            // Fetch restaurants that offer catering
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('catering_available', true);

            if (error) throw error;

            // If no restaurants have catering_available set, fetch all restaurants
            if (!data || data.length === 0) {
                const { data: allData, error: allError } = await supabase
                    .from('restaurants')
                    .select('*');

                if (allError) throw allError;

                // Randomly select 6 restaurants
                const shuffled = shuffleArray(allData || []);
                setCateringRestaurants(shuffled.slice(0, 6));
            } else {
                // Randomly select up to 6 catering restaurants
                const shuffled = shuffleArray(data);
                setCateringRestaurants(shuffled.slice(0, 6));
            }
        } catch (err) {
            console.error('Error fetching catering restaurants:', err);
            setError('Failed to load restaurants available for catering');
        } finally {
            setLoading(false);
        }
    };

    const testSupabaseConnection = async () => {
        try {
            console.log('Testing Supabase connection...');

            // Try a simple query
            const { data, error } = await supabase
                .from('restaurants')
                .select('id, name')
                .limit(1);

            if (error) {
                console.error('Supabase connection test failed:', error);
                return false;
            }

            console.log('Supabase connection test successful:', data);
            return true;
        } catch (err) {
            console.error('Error testing Supabase connection:', err);
            return false;
        }
    };

    // Helper function to shuffle array
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleRestaurantSelect = (id) => {
        setSelectedRestaurant(id);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please sign in to submit a catering request');
            return;
        }

        if (!selectedRestaurant) {
            setError('Please select a restaurant');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            console.log("Submitting catering request with user:", user);
            console.log("User ID:", user.id);
            console.log("User ID as string:", user.id.toString());

            // Get the current user ID from Supabase
            const { data: authData, error: authError } = await supabase.auth.getSession();
            if (authError) {
                throw new Error(`Error getting authenticated user session: ${authError.message}`);
            }

            console.log("Auth session data from Supabase:", authData);
            const userId = authData.session?.user?.id || user.id;
            console.log("Using user ID:", userId);

            // Format date to ISO format for Supabase
            const formattedDate = new Date(formData.event_date).toISOString();

            // Prepare the catering request data
            const cateringData = {
                user_id: userId.toString(),
                restaurant_id: parseInt(selectedRestaurant),
                event_name: formData.event_name,
                event_date: formattedDate,
                event_time: formData.event_time,
                num_guests: parseInt(formData.num_guests),
                address: formData.address,
                city: formData.city,
                province: formData.province,
                postal_code: formData.postal_code,
                phone: formData.phone,
                email: formData.email,
                occasion: formData.occasion || null,
                dietary_restrictions: formData.dietary_restrictions || null,
                additional_notes: formData.additional_notes || null,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log("Inserting catering request with data:", cateringData);

            // Insert the catering request
            const { data, error } = await supabase
                .from('catering_requests')
                .insert([cateringData]);

            if (error) {
                console.error("Error submitting catering request:", error);
                throw new Error(`Failed to submit catering request: ${error.message}`);
            }

            console.log("Catering request submitted successfully:", data);

            setSuccess(true);

            // Reset form
            setFormData({
                event_name: '',
                event_date: '',
                event_time: '',
                num_guests: '',
                address: '',
                city: '',
                province: '',
                postal_code: '',
                phone: '',
                email: user?.email || '',
                occasion: '',
                dietary_restrictions: '',
                additional_notes: ''
            });

            setSelectedRestaurant(null);

            // Scroll to top to show success message
            window.scrollTo(0, 0);

        } catch (err) {
            console.error('Error submitting catering request:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const testSubmission = async () => {
        try {
            setSubmitting(true);
            console.log('Testing submission with minimal data...');

            // Create a minimal test object
            const testData = {
                user_id: user?.id?.toString() || '1',
                restaurant_id: 1,
                event_name: 'Test Event',
                event_date: new Date().toISOString(),
                event_time: '12:00',
                num_guests: 10,
                address: '123 Test St',
                city: 'Test City',
                province: 'Test Province',
                postal_code: 'T3ST',
                phone: '123-456-7890',
                email: 'test@example.com',
                status: 'test'
            };

            console.log('Test data:', testData);

            // Try to insert the test data
            const { data, error } = await supabase
                .from('catering_requests')
                .insert([testData]);

            if (error) {
                console.error('Test submission failed:', error);
                setError(`Test submission failed: ${error.message}`);
            } else {
                console.log('Test submission successful:', data);
                alert('Test submission successful! Check the console for details.');
            }
        } catch (err) {
            console.error('Error in test submission:', err);
            setError(`Test error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Add this function to test the catering_requests table
    const testCateringTable = async () => {
        try {
            setSubmitting(true);
            setError(null);

            console.log("Testing catering_requests table...");

            // Test if catering_requests table exists
            const { data: tableData, error: tableError } = await supabase
                .from('catering_requests')
                .select('id')
                .limit(1);

            if (tableError) {
                console.error("Error checking catering_requests table:", tableError);
                setError(`Error checking catering_requests table: ${tableError.message}`);
                return;
            }

            console.log("catering_requests table exists and is accessible");

            // Get the current user ID from Supabase
            const { data: authData, error: authError } = await supabase.auth.getSession();
            if (authError) {
                console.error("Error getting authenticated user session:", authError);
                setError(`Error getting authenticated user session: ${authError.message}`);
                return;
            }

            const userId = authData.session?.user?.id || user.id;

            // Try to insert a test record
            const testData = {
                user_id: userId.toString(),
                restaurant_id: 1, // Assuming restaurant ID 1 exists
                event_name: "Test Event",
                event_date: new Date().toISOString(),
                event_time: "12:00 PM",
                num_guests: 10,
                address: "123 Test St",
                city: "Test City",
                province: "Test Province",
                postal_code: "T3ST1N",
                phone: "555-555-5555",
                email: user.email || "test@example.com",
                occasion: "Test",
                dietary_restrictions: null,
                additional_notes: "This is a test record",
                status: "test"
            };

            console.log("Inserting test record:", testData);

            const { data: insertData, error: insertError } = await supabase
                .from('catering_requests')
                .insert([testData]);

            if (insertError) {
                console.error("Error inserting test record:", insertError);

                // Check if it's an RLS error
                if (insertError.message.includes('row-level security policy')) {
                    const errorMessage = `
RLS Policy Error: ${insertError.message}

To fix this issue, run the following SQL in your Supabase SQL Editor:

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own catering requests" ON public.catering_requests;
DROP POLICY IF EXISTS "Users can insert their own catering requests" ON public.catering_requests;
DROP POLICY IF EXISTS "Users can update their own catering requests" ON public.catering_requests;
DROP POLICY IF EXISTS "Users can delete their own catering requests" ON public.catering_requests;

-- Disable RLS completely (simplest solution)
ALTER TABLE public.catering_requests DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON public.catering_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.catering_requests_id_seq TO authenticated;
`;
                    setError(errorMessage);
                } else {
                    setError(`Error inserting test record: ${insertError.message}`);
                }
                return;
            }

            console.log("Test record inserted successfully");

            // Delete the test record
            const { error: deleteError } = await supabase
                .from('catering_requests')
                .delete()
                .eq('status', 'test');

            if (deleteError) {
                console.error("Error deleting test record:", deleteError);
                // Not critical, continue
            } else {
                console.log("Test record deleted successfully");
            }

            setSuccess(true);
            alert("Catering table test successful! The table exists and you have permission to insert records.");

        } catch (err) {
            console.error("Error testing catering table:", err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Request Catering Services</h1>

            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="mb-4">
                    <Alert.Heading>Catering Request Submitted!</Alert.Heading>
                    <p>
                        Thank you for your catering request. We will review your request and get back to you shortly.
                    </p>
                </Alert>
            )}

            {/* Add this section for administrators to fix RLS issues */}
            {error && error.includes('row-level security policy') && (
                <Alert variant="danger" className="mb-4">
                    <Alert.Heading>Row Level Security Error</Alert.Heading>
                    <p>
                        There is an issue with the Row Level Security policies for the catering_requests table.
                        Please run the following SQL commands in your Supabase SQL Editor to fix the issue:
                    </p>
                    <pre className="bg-light p-3 border rounded">
                        {`-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own catering requests" ON public.catering_requests;
DROP POLICY IF EXISTS "Users can insert their own catering requests" ON public.catering_requests;
DROP POLICY IF EXISTS "Users can update their own catering requests" ON public.catering_requests;
DROP POLICY IF EXISTS "Users can delete their own catering requests" ON public.catering_requests;

-- Option 1: Disable RLS completely (simplest solution)
ALTER TABLE public.catering_requests DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON public.catering_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.catering_requests_id_seq TO authenticated;

-- Option 2: Create proper RLS policies (if you want to keep RLS enabled)
-- Uncomment and run these commands if you prefer this approach
/*
-- Enable RLS
ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for catering_requests
CREATE POLICY "Users can view their own catering requests"
ON public.catering_requests
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own catering requests"
ON public.catering_requests
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own catering requests"
ON public.catering_requests
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own catering requests"
ON public.catering_requests
FOR DELETE
USING (auth.uid()::text = user_id);
*/`}
                    </pre>
                </Alert>
            )}

            {!user && (
                <Alert variant="warning" className="mb-4">
                    Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>sign in</Button> to submit a catering request.
                </Alert>
            )}

            <Row>
                <Col lg={8}>
                    <Card className="mb-4 catering-form-card">
                        <Card.Header className="bg-primary text-white">
                            <h3 className="mb-0">Request Catering</h3>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <h4 className="mb-3">1. Select a Restaurant</h4>
                                <Row className="mb-4">
                                    {cateringRestaurants.map(restaurant => (
                                        <Col md={6} lg={4} key={restaurant.id} className="mb-3">
                                            <Card
                                                className={`h-100 restaurant-select-card ${selectedRestaurant === restaurant.id ? 'selected' : ''}`}
                                                onClick={() => handleRestaurantSelect(restaurant.id)}
                                            >
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title>{restaurant.name}</Card.Title>
                                                    <Card.Text className="text-muted small mb-2">
                                                        {restaurant.address}, {restaurant.city}
                                                    </Card.Text>
                                                    <div className="mt-auto">
                                                        {selectedRestaurant === restaurant.id && (
                                                            <div className="selected-indicator">
                                                                <FaUtensils /> Selected
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                <h4 className="mb-3">2. Event Details</h4>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Event Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="event_name"
                                                value={formData.event_name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="e.g. Birthday Party, Corporate Event"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Event Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="event_date"
                                                value={formData.event_date}
                                                onChange={handleInputChange}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Event Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="event_time"
                                                value={formData.event_time}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Occasion</Form.Label>
                                            <Form.Select
                                                name="occasion"
                                                value={formData.occasion}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Occasion</option>
                                                <option value="Birthday">Birthday</option>
                                                <option value="Wedding">Wedding</option>
                                                <option value="Corporate">Corporate Event</option>
                                                <option value="Holiday">Holiday Party</option>
                                                <option value="Graduation">Graduation</option>
                                                <option value="Other">Other</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Number of Guests</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="num_guests"
                                                value={formData.num_guests}
                                                onChange={handleInputChange}
                                                required
                                                min="1"
                                                placeholder="How many people will attend?"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h4 className="mb-3">3. Contact Information</h4>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Street address"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Province</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="province"
                                                value={formData.province}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Postal Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone Number</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Your contact number"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Your email address"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h4 className="mb-3">4. Additional Information</h4>
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Dietary Restrictions</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="dietary_restrictions"
                                                value={formData.dietary_restrictions}
                                                onChange={handleInputChange}
                                                placeholder="Any allergies or dietary restrictions we should know about?"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Additional Notes</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="additional_notes"
                                                value={formData.additional_notes}
                                                onChange={handleInputChange}
                                                placeholder="Any special requests or additional information?"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        disabled={submitting || !user || !selectedRestaurant}
                                    >
                                        {submitting ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Catering Request'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="mb-4 catering-info-card">
                        <Card.Header className="bg-primary text-white">
                            <h3 className="mb-0">Catering Information</h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="info-item">
                                <FaUtensils className="info-icon" />
                                <div>
                                    <h5>Authentic Indian Cuisine</h5>
                                    <p>We offer a wide variety of authentic Indian dishes prepared by experienced chefs.</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaCalendarAlt className="info-icon" />
                                <div>
                                    <h5>Advance Booking</h5>
                                    <p>Please book at least 72 hours in advance for catering services.</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaUsers className="info-icon" />
                                <div>
                                    <h5>Group Sizes</h5>
                                    <p>We cater to groups of all sizes, from intimate gatherings to large events.</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaMapMarkerAlt className="info-icon" />
                                <div>
                                    <h5>Service Area</h5>
                                    <p>We provide catering services throughout the Greater Vancouver area.</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaPhone className="info-icon" />
                                <div>
                                    <h5>Contact Us</h5>
                                    <p>For urgent inquiries, please call us at (604) 123-4567.</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaEnvelope className="info-icon" />
                                <div>
                                    <h5>Email</h5>
                                    <p>For general inquiries: catering@indianfooddelivery.com</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CateringPage; 