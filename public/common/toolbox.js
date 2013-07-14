module.exports = {

	objComparator : function(pred, obj){
		return function (obj2){
			return pred(obj, obj2);
		}
	}	
}