const initLlama = jest.fn(() => Promise.resolve({ id: 1 }));
const LlamaContext = jest.fn().mockImplementation(() => ({
  completion: jest.fn(() =>
    Promise.resolve({ text: '{"answer": "Mock response"}' }),
  ),
  stopCompletion: jest.fn(() => Promise.resolve()),
  release: jest.fn(() => Promise.resolve()),
}));

module.exports = { initLlama, LlamaContext };
