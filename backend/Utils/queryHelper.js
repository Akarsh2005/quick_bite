export const applyQueryFeatures = async (model, queryString, populateOptions = null) => {
    // 1. Filtering
    const queryObj = { ...queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering (for MongoDB operators like gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|regex|options)\b/g, match => `$${match}`);
    let filter = JSON.parse(queryStr);

    // Support text search/regex search if 'search' query parameter exists
    if (queryString.search) {
        filter = {
            ...filter,
            $or: [
                { name: { $regex: queryString.search, $options: 'i' } },
                { description: { $regex: queryString.search, $options: 'i' } }
            ]
        };
    }

    // Build the query
    let query = model.find(filter);

    // 2. Sorting
    if (queryString.sort) {
        const sortBy = queryString.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt'); // default sort
    }

    // 3. Field Limiting (Projection)
    if (queryString.fields) {
        const fields = queryString.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }

    // 4. Pagination
    const page = parseInt(queryString.page, 10) || 1;
    const limit = parseInt(queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);

    // Populate if options provided
    if (populateOptions) {
        query = query.populate(populateOptions);
    }

    // Execute query & get total documents for pagination info
    const data = await query;
    const total = await model.countDocuments(filter);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};
