import { api } from "@/net/axios";
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";

export default function useAuth(initialTab = "login") {
  const router = useRouter();
  const activeTab = ref(initialTab);
  const isLoading = ref(false);
  const statusMessage = ref("");
  const statusType = ref("");

  // Login Form
  const loginForm = reactive({
    email: "",
    password: "",
  });

  // Register Form
  const registerForm = reactive({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Form Errors
  const errors = reactive({
    loginEmail: "",
    loginPassword: "",
    registerName: "",
    registerEmail: "",
    registerPassword: "",
    registerConfirmPassword: "",
  });

  // Clear all errors
  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      errors[key as keyof typeof errors] = "";
    });
  };

  // Validate login form
  const validateLoginForm = () => {
    clearErrors();
    let isValid = true;

    if (!loginForm.email) {
      errors.loginEmail = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.loginEmail = "Email format is invalid";
      isValid = false;
    }

    if (!loginForm.password) {
      errors.loginPassword = "Password is required";
      isValid = false;
    } else if (loginForm.password.length < 6) {
      errors.loginPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    return isValid;
  };

  // Validate registration form
  const validateRegisterForm = () => {
    clearErrors();
    let isValid = true;

    if (!registerForm.name) {
      errors.registerName = "Name is required";
      isValid = false;
    }

    if (!registerForm.email) {
      errors.registerEmail = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      errors.registerEmail = "Email format is invalid";
      isValid = false;
    }

    if (!registerForm.password) {
      errors.registerPassword = "Password is required";
      isValid = false;
    } else if (registerForm.password.length < 6) {
      errors.registerPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!registerForm.confirmPassword) {
      errors.registerConfirmPassword = "Please confirm your password";
      isValid = false;
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.registerConfirmPassword = "Passwords do not match";
      isValid = false;
    }

    return isValid;
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    try {
      isLoading.value = true;
      statusMessage.value = "";

      const response = await api.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password,
      });

      // Handle successful login
      if (response.data.token) {
        // Store token in localStorage or other state management
        localStorage.setItem("authToken", response.data.token);

        // Set authorization header for future requests
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;

        statusType.value = "success";
        statusMessage.value = "Login successful! Redirecting...";

        // Redirect to dashboard or home page after successful login
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      }
    } catch (error: any) {
      statusType.value = "error";
      statusMessage.value =
        error.response?.data?.message || "Login failed. Please try again.";
    } finally {
      isLoading.value = false;
    }
  };

  // Handle registration submission
  const handleRegister = async () => {
    if (!validateRegisterForm()) return;

    try {
      isLoading.value = true;
      statusMessage.value = "";

      const response = await api.post("/auth/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });

      // Handle successful registration
      statusType.value = "success";
      statusMessage.value = "Registration successful! You can now log in.";

      // Clear form and switch to login tab
      registerForm.name = "";
      registerForm.email = "";
      registerForm.password = "";
      registerForm.confirmPassword = "";

      setTimeout(() => {
        activeTab.value = "login";
      }, 1500);
    } catch (error: any) {
      statusType.value = "error";
      statusMessage.value =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    activeTab,
    loginForm,
    registerForm,
    errors,
    isLoading,
    statusMessage,
    statusType,
    handleLogin,
    handleRegister,
  };
}
