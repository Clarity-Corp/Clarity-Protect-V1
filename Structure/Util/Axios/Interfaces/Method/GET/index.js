class Get {
    async send(url, config = {}) {
        const { baseURL = '', headers = {}, params } = config;
        const requestUrl = baseURL + url;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        try {
            const resp = await fetch(requestUrl, options);
            const data = await resp.json();
            return { data, status: resp.status }
        } catch (e) {
            console.error('[GET] Request Error:',e)
        }
    }
}

module.exports = Get