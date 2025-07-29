// Конфигурация Agora
export const agoraConfig = {
  appId:
    import.meta.env.VITE_AGORA_APP_ID || "67f58d2ce54b46ddb2e73f2cadaa6899",
  // Для тестирования используем null токены
  // В продакшене токены должны генерироваться на сервере
  enableTokenAuthentication: false,
};
