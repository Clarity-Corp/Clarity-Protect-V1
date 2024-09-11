class Delete {
    async send(url, config = {}) {
        const { baseURL = '', headers = {}, params } = config;
        const requestUrl = baseURL + url;
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        try {
            const resp = await fetch(requestUrl, options);
            const respData = await resp.json();
            return { data: respData, status: resp.status }
        } catch (e) {
            console.error('[DELETE] Request Error:',e)
        }
    }
}

module.exports = Delete