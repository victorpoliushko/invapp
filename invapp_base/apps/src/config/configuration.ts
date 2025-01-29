export default () => ({
  test_port_configuration: parseInt(process.env.PORT, 10) || 3000,
});
