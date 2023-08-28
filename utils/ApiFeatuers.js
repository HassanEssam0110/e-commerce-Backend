class ApiFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    //Filter Method
    filter() {
        const queryStringObj = { ...this.queryString };
        const excludesFields = ['page', 'limit', 'fields', 'sort'];

        excludesFields.forEach((field) => delete queryStringObj[field]);   //==>remove fields from queryStringObj

        // Apply filteration using [gte,gt,lt,lte]
        let queryStr = JSON.stringify(queryStringObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //to add $ before gte,.. in query

        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

        //return  this object to can make access or chan other methods
        return this;
    }


    //Sort Method
    sort() {
        if (this.queryString.sort) {
            // price,-sold =>[price,-sold]=> price -sold
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.mongooseQuery = this.mongooseQuery.sort(sortBy)
        } else {
            this.mongooseQuery = this.mongooseQuery.sort('-createdAt')
        }

        return this;
    }


    // Limit Method 
    limitFields() {
        if (this.queryString.fields) {
            // title,price =>[title,price]=> title price
            const fields = this.queryString.fields.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery = this.mongooseQuery.select("-__v")
        }

        return this;
    }


    //Search Method
    search(modelName) {
        if (this.queryString.keyword) {
            let query = {};
            if (modelName === 'Products') {
                query.$or = [
                    { title: { $regex: this.queryString.keyword, $options: "i" } },
                    { description: { $regex: this.queryString.keyword, $options: "i" } }
                ];
            } else {
                query = { name: { $regex: this.queryString.keyword, $options: 'i' } };
            }

            this.mongooseQuery = this.mongooseQuery.find(query)
        };

        return this;
    }

    //pagination Method
    paginate(countDouments) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 50;
        const skip = (page - 1) * limit; //(2-1)*5=5 items pagination
        const endPageIndex = page * limit; // 2 * 10 =20 

        //pagination Result
        const pagination = {};
        pagination.currentPage = page;
        pagination.limit = limit;
        pagination.numberofPages = Math.ceil(countDouments / limit);// number pages = all document in DB / limit   50/10=5

        //next page
        if (endPageIndex < countDouments) {
            pagination.next = page + 1;
        }

        //prev page
        if (skip > 0) {
            pagination.prev = page - 1;
        }


        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit)
        this.paginationResult = pagination;
        return this;
    }
}


module.exports = ApiFeatures;