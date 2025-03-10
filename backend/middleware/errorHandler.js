export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.errors && Array.isArray(err.errors)) {
        return res.status(400).json({
            status: 'fail',
            errors: err.errors
        });
    }

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};