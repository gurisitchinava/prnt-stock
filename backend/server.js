const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const PORT = process.env.PORT || 3000;

const orders = []; // Array to store orders

// Function to add a new order
function addOrder(orderData) {
    const newOrder = { id: uuidv4(), ...orderData }; // Generate UUID for the order
    orders.push(newOrder);
    return newOrder;
}

// Function to serve the edit-order page with the specified order ID
function serveStaticFileWithOrderId(filePath, contentType, orderId, res) {
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error: ' + err.code);
            }
        } else {
            // Inject order ID into the HTML content
            const editedContent = content.replace('{{orderId}}', orderId);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(editedContent, 'utf-8');
        }
    });
}

// Function to serve the edit-order page
function serveEditOrderPage(filePath, contentType, res, orderId) {
    serveStaticFileWithOrderId(filePath, contentType, orderId, res);
}

const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    const pathname = reqUrl.pathname;

    if (req.method === 'POST' && pathname === '/add-order') {
        // Handle adding new order
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const { productName, category, status, description, price, quantity } = JSON.parse(body);
            const newOrder = addOrder({ productName, category, status, description, price, quantity }); // Call addOrder function
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Order added successfully', order: newOrder }));
        });
    } else if (req.method === 'GET' && pathname === '/add-order') {
        // Serve add-order.html page
        serveStaticFile('./frontend/add-order.html', 'text/html', res);
    } else if (req.method === 'GET' && pathname === '/orders') {
        // Serve orders data
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(orders));
    } else if (req.method === 'GET' && pathname === '/edit-order') {
        // Serve edit-order.html page
        serveStaticFile('./frontend/edit-order.html', 'text/html', res);
    } else if (req.method === 'GET' && pathname.startsWith('/edit-order/')) {
        // Serve edit-order.html page with order ID
        const orderId = pathname.split('/').pop();
        serveEditOrderPage('./frontend/edit-order.html', 'text/html', res, orderId);
    } else if (req.method === 'GET' && pathname.startsWith('/order/')) {
        // Serve order details based on order ID
        const orderId = pathname.split('/').pop();
        const order = orders.find(order => order.id === orderId);
        if (order) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(order));
        } else {
            res.writeHead(404);
            res.end('Order not found');
        }
    } else if (req.method === 'GET' && pathname === '/') {
        // Serve index.html page for root URL
        serveStaticFile('./frontend/index.html', 'text/html', res);
    } else {
        // Serve other static files
        const filePath = `.${pathname}`;
        serveStaticFile(filePath, getContentType(filePath), res);
    }
});

function serveStaticFile(filePath, contentType, res) {
    // Check if filePath points to a directory
    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error: ' + err.code);
            }
        } else {
            if (stats.isDirectory()) {
                // If it's a directory, serve index.html inside that directory
                filePath = path.join(filePath, 'index.html');
            }

            // Read the file and serve its content
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    if (err.code == 'ENOENT') {
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(500);
                        res.end('500 Internal Server Error: ' + err.code);
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        }
    });
}

function getContentType(filePath) {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
            return 'image/jpg';
        case '.html':
            return 'text/html';
        default:
            return 'text/plain';
    }
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
