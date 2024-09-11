class Head {
    async send(url, config = {}) {
        const { baseURL = '', headers = {}, params } = config;
        const requestUrl = baseURL + url;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        try {
            const resp = await fetch(requestUrl, options);
            return { headers: resp.headers, status: resp.status, statusText: resp.statusText }
        } catch (e) {
            console.error('[HEAD] Request Error:',e)
        }
    }
}

module.exports = Head