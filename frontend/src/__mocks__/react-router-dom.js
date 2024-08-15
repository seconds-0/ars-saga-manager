const actualReactRouterDom = jest.requireActual('react-router-dom');

module.exports = {
  ...actualReactRouterDom,
  useParams: jest.fn(),
};