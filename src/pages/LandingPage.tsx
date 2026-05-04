import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Nav,
  Row,
  Stack,
} from 'react-bootstrap';
import { useDB } from '../utils/localdb/db';
import { useAuth } from '../utils/context/AuthContext';
import { useForm } from 'react-hook-form';

interface LoginFormValues {
  email: string;
  password: string;
}

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

function LandingPage() {
  const navigate = useNavigate();
  const db = useDB();
  const { login, userId, user, logout } = useAuth();
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [signUpMessage, setSignUpMessage] = useState<{
    type: 'success' | 'danger';
    text: string;
  } | null>(null);

  const loginForm = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpFormValues>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onLogin = (data: LoginFormValues) => {
    const found = db.authenticateUser(data.email, data.password);
    if (!found) {
      loginForm.setError('root', {
        message: 'Invalid email or password, or account is inactive.',
      });
      return;
    }
    loginForm.clearErrors('root');
    login(found.id);
    if (found.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  const onSignUp = (data: SignUpFormValues) => {
    setSignUpMessage(null);
    if (data.password !== data.confirmPassword) {
      signUpForm.setError('confirmPassword', {
        message: 'Passwords do not match',
      });
      return;
    }
    const result = db.registerStudent(data.email, data.password);
    if (!result.ok) {
      setSignUpMessage({
        type: 'danger',
        text: 'An account with this email already exists.',
      });
      return;
    }
    signUpForm.reset();
    setSignUpMessage({
      type: 'success',
      text: 'Account created. You can sign in below.',
    });
    setAuthTab('login');
    loginForm.setValue('email', result.user.email);
  };

  const goToDashboard = () => {
    if (!user) return;
    navigate(user.role === 'admin' ? '/admin' : '/student');
  };

  return (
    <div className="landing-container">
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <Card className="shadow border-0">
            <Card.Body className="p-4 p-md-5">
              <Card.Title
                as="h1"
                className="text-center mb-4 landing-title"
              >
                Event Manager
              </Card.Title>
              <p className="text-center text-muted small mb-4">
                Sign in or create a student account to register for events.
              </p>

              {userId && user ? (
                <Stack gap={3}>
                  <p className="text-center mb-0">
                    Signed in as <strong>{user.email}</strong>
                    <span className="text-muted"> ({user.role})</span>
                  </p>
                  <Button variant="primary" size="lg" onClick={goToDashboard}>
                    Continue to dashboard
                  </Button>
                  <Button variant="outline-danger" onClick={() => logout()}>
                    Log out
                  </Button>
                </Stack>
              ) : (
                <>
                  <Nav
                    variant="pills"
                    className="justify-content-center gap-2 mb-4"
                  >
                    <Nav.Item>
                      <Nav.Link
                        active={authTab === 'login'}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setAuthTab('login');
                          setSignUpMessage(null);
                        }}
                        className="px-4"
                      >
                        Sign in
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        active={authTab === 'signup'}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setAuthTab('signup');
                          setSignUpMessage(null);
                        }}
                        className="px-4"
                      >
                        Sign up
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  {authTab === 'login' ? (
                    <Form
                      onSubmit={loginForm.handleSubmit(onLogin)}
                      className="d-grid gap-3"
                    >
                      {loginForm.formState.errors.root && (
                        <Alert variant="danger" className="py-2 mb-0">
                          {loginForm.formState.errors.root.message}
                        </Alert>
                      )}
                      <Form.Group controlId="loginEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...loginForm.register('email', {
                            required: 'Email is required',
                          })}
                          isInvalid={!!loginForm.formState.errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {loginForm.formState.errors.email?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="loginPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          autoComplete="current-password"
                          {...loginForm.register('password', {
                            required: 'Password is required',
                          })}
                          isInvalid={!!loginForm.formState.errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {loginForm.formState.errors.password?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Button variant="primary" type="submit" size="lg">
                        Sign in
                      </Button>
                    </Form>
                  ) : (
                    <Form
                      onSubmit={signUpForm.handleSubmit(onSignUp)}
                      className="d-grid gap-3"
                    >
                      {signUpMessage && (
                        <Alert
                          variant={signUpMessage.type}
                          className="py-2 mb-0"
                        >
                          {signUpMessage.text}
                        </Alert>
                      )}
                      <Form.Group controlId="signupEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...signUpForm.register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Enter a valid email',
                            },
                          })}
                          isInvalid={!!signUpForm.formState.errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {signUpForm.formState.errors.email?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="signupPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                          {...signUpForm.register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Use at least 6 characters',
                            },
                          })}
                          isInvalid={!!signUpForm.formState.errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {signUpForm.formState.errors.password?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="signupConfirm">
                        <Form.Label>Confirm password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Repeat password"
                          autoComplete="new-password"
                          {...signUpForm.register('confirmPassword', {
                            required: 'Please confirm your password',
                          })}
                          isInvalid={
                            !!signUpForm.formState.errors.confirmPassword
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {signUpForm.formState.errors.confirmPassword?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Button variant="success" type="submit" size="lg">
                        Create student account
                      </Button>
                      <p className="text-muted small text-center mb-0">
                        Admin accounts are created by an administrator only.
                      </p>
                    </Form>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default LandingPage;
