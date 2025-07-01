const URL = 'https://weapper-a36jmdug6-tasneem205s-projects.vercel.app/weather';
const endpoints = [
  {
    category: 'Location',
    items: [
      {
        path: '/data/:location/:unit',
        method: 'GET',
        description: 'Fetches weather forecast data for a location and unit.',
        parameters: [
          { name: 'location', description: 'The city or location (e.g., newyork)' },
          { name: 'unit', description: 'Temperature unit (celsius or fahrenheit)', options: ['celsius', 'fahrenheit'] },
        ],
        exampleRequest: `GET ${URL}/newyork/celsius`,
        testType: 'form',
      },
    ],
  },
  {
    category: 'Health',
    items: [
      {
        path: '/ping',
        method: 'GET',
        description: 'Tests connectivity to the Upstash Redis instance.',
        parameters: [],
        exampleRequest: `GET ${URL}/ping`,
        testType: 'button',
      },
    ],
  },
];

const container = document.getElementById('endpoint-container');
endpoints.forEach((category, catIndex) => {
  const categoryId = `category-${catIndex}`;
  const categoryHtml = `
    <div class="mb-4">
      <h3
        class="text-xl font-semibold text-gray-700 bg-gray-200 p-3 rounded-lg cursor-pointer hover:bg-gray-300"
        onclick="toggleCategory('${categoryId}')"
      >
        ${category.category}
      </h3>
      <div id="${categoryId}" class="category-content p-4 bg-white rounded-lg shadow-md">
        ${category.items
          .map((endpoint, itemIndex) => {
            const endpointId = `endpoint-${catIndex}-${itemIndex}`;
            return `
              <div class="mb-4">
                <h4 class="text-lg font-semibold text-gray-700 mb-2">${endpoint.method} ${endpoint.path}</h4>
                <p class="text-gray-600 mb-2">${endpoint.description}</p>
                ${
                  endpoint.parameters.length > 0
                    ? `
                      <p class="text-gray-600 mb-2"><strong>Parameters:</strong></p>
                      <ul class="list-disc pl-6 text-gray-600 mb-2">
                        ${endpoint.parameters
                          .map(
                            (param) =>
                              `<li><code>${param.name}</code>: ${param.description}</li>`
                          )
                          .join('')}
                      </ul>
                    `
                    : ''
                }
                <p class="text-gray-600 mb-2"><strong>Example Request:</strong></p>
                <pre class="text-sm">${endpoint.exampleRequest}</pre>
                ${
                  endpoint.testType === 'form'
                    ? `
                      <form id="test-${endpointId}" class="mt-4">
                        ${endpoint.parameters
                          .map((param) => {
                            if (param.options) {
                              return `
                                <div class="mb-4">
                                  <label for="${endpointId}-${param.name}" class="block text-gray-700 font-medium mb-2">${param.name.charAt(0).toUpperCase() + param.name.slice(1)}:</label>
                                  <select
                                    id="${endpointId}-${param.name}"
                                    class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    ${param.options
                                      .map(
                                        (option) => `<option value="${option}">${option.charAt(0).toUpperCase() + option.slice(1)}</option>`
                                      )
                                      .join('')}
                                  </select>
                                </div>
                              `;
                            }
                            return `
                              <div class="mb-4">
                                <label for="${endpointId}-${param.name}" class="block text-gray-700 font-medium mb-2">${param.name.charAt(0).toUpperCase() + param.name.slice(1)}:</label>
                                <input
                                  type="text"
                                  id="${endpointId}-${param.name}"
                                  placeholder="e.g., newyork"
                                  class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                              </div>
                            `;
                          })
                          .join('')}
                        <button
                          type="submit"
                          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                          Test Endpoint
                        </button>
                      </form>
                    `
                    : `
                      <button
                        onclick="testEndpoint('${endpointId}', '${endpoint.path}')"
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-4"
                      >
                        Test Endpoint
                      </button>
                    `
                }
                <div class="mt-4">
                  <h5 class="text-md font-semibold text-gray-700 mb-2">Response:</h5>
                  <pre id="response-${endpointId}" class="response-output text-sm hidden"></pre>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
  container.innerHTML += categoryHtml;
});

function toggleCategory(categoryId) {
  const content = document.getElementById(categoryId);
  const isActive = content.classList.contains('active');
  document.querySelectorAll('.category-content').forEach((el) => {
    el.classList.remove('active');
  });
  if (!isActive) {
    content.classList.add('active');
  }
}

document.querySelectorAll('form[id^="test-"]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpointId = form.id.replace('test-', '');
    const location = document.getElementById(`${endpointId}-location`)?.value.trim();
    const unit = document.getElementById(`${endpointId}-unit`)?.value;
    const output = document.getElementById(`response-${endpointId}`);

    if (!location) {
      output.textContent = JSON.stringify({ error: 'Location is required' }, null, 2);
      output.classList.remove('hidden');
      return;
    }

    output.textContent = 'Loading...';
    output.classList.remove('hidden');

    try {
      const response = await fetch(`${URL}/${encodeURIComponent(location)}/${unit}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      output.textContent = JSON.stringify({
        error: 'Failed to fetch data',
        message: error.message,
      }, null, 2);
    }
  });
});

window.testEndpoint = async function (endpointId, path) {
  const output = document.getElementById(`response-${endpointId}`);
  output.textContent = 'Loading...';
  output.classList.remove('hidden');

  try {
    const response = await fetch(`${URL}${path}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    output.textContent = JSON.stringify({
      error: `Failed to fetch ${path}`,
      message: error.message,
    }, null, 2);
  }
};