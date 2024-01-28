class APIfeauture {
  constructor(query, querystring) {
    this.query = query;
    this.querystring = querystring;
  }

  filter() {
    const queryobj = { ...this.querystring };
    const excludedfield = ['sort', 'page', 'limit', 'field'];
    excludedfield.forEach((el) => delete queryobj[el]);
    let querystr = JSON.stringify(queryobj);
    querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(querystr));
    
    return this;
  }
  sort() {
    if (this.querystring.sort) {
      const sortedBy = this.querystring.sort.split(',').join(' ');
      this.query = this.query.sort(sortedBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limit() {
    if (this.querystring.field) {
      const field = this.querystring.field.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.querystring.page * 1 || 1;
    const limit = this.querystring.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIfeauture;