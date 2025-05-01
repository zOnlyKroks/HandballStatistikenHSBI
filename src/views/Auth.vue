<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button
          class="auth-tab"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>

      <!-- Login Form -->
      <form
        v-if="activeTab === 'login'"
        class="auth-form"
        @submit.prevent="handleLogin"
      >
        <div class="form-group">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            v-model="loginForm.email"
            type="email"
            required
            placeholder="Enter your email"
          />
          <span v-if="errors.loginEmail" class="error-message">{{
            errors.loginEmail
          }}</span>
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            required
            placeholder="Enter your password"
          />
          <span v-if="errors.loginPassword" class="error-message">{{
            errors.loginPassword
          }}</span>
        </div>

        <div class="form-footer">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? "Logging in..." : "Login" }}
          </button>
        </div>
      </form>

      <!-- Register Form -->
      <form
        v-if="activeTab === 'register'"
        class="auth-form"
        @submit.prevent="handleRegister"
      >
        <div class="form-group">
          <label for="register-name">Full Name</label>
          <input
            id="register-name"
            v-model="registerForm.name"
            type="text"
            required
            placeholder="Enter your name"
          />
          <span v-if="errors.registerName" class="error-message">{{
            errors.registerName
          }}</span>
        </div>

        <div class="form-group">
          <label for="register-email">Email</label>
          <input
            id="register-email"
            v-model="registerForm.email"
            type="email"
            required
            placeholder="Enter your email"
          />
          <span v-if="errors.registerEmail" class="error-message">{{
            errors.registerEmail
          }}</span>
        </div>

        <div class="form-group">
          <label for="register-password">Password</label>
          <input
            id="register-password"
            v-model="registerForm.password"
            type="password"
            required
            placeholder="Create a password"
          />
          <span v-if="errors.registerPassword" class="error-message">{{
            errors.registerPassword
          }}</span>
        </div>

        <div class="form-group">
          <label for="register-confirm-password">Confirm Password</label>
          <input
            id="register-confirm-password"
            v-model="registerForm.confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
          />
          <span v-if="errors.registerConfirmPassword" class="error-message">{{
            errors.registerConfirmPassword
          }}</span>
        </div>

        <div class="form-footer">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? "Creating account..." : "Create Account" }}
          </button>
        </div>
      </form>

      <!-- Status Message -->
      <div v-if="statusMessage" :class="['status-message', statusType]">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useAuth from "@/composables/useAuth";

export default defineComponent({
  name: "Auth",
  props: {
    defaultTab: {
      type: String,
      default: "login",
    },
  },
  setup(props) {
    const {
      activeTab,
      loginForm,
      registerForm,
      errors,
      isLoading,
      statusMessage,
      statusType,
      handleLogin,
      handleRegister,
    } = useAuth(props.defaultTab);

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
  },
});
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 0 auto;
}

.auth-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.auth-tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-tab.active {
  color: #4a90e2;
  border-bottom: 2px solid #4a90e2;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90e2;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
}

.form-footer {
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #3a80d2;
}

.submit-btn:disabled {
  background-color: #95bef0;
  cursor: not-allowed;
}

.status-message {
  margin-top: 16px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
