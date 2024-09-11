class Post {
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
            const respData = await resp.json();
            return { data: respData, status: resp.status }
        } catch (e) {
            console.error('[POST] Request Error:',e)
        }
    }
}

module.exports = Post