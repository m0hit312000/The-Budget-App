// Budget Controller
var budgetController = (function (){

    var Expense = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome)
    {
        if(totalIncome>0)
        this.percentage = Math.round((this.value/totalIncome)*100); 
        else
        this.percentage = -1;
    };

    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    };

    var Income = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value; 
    }

    var calculateTotal = function(type)
    {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.total[type] = sum;
    };

    var data = {
        allItems:{
            exp: [],
            inc: [],
        },
        total:{
            exp:0,
            inc:0,
        },
        budget: 0,
        percentage: -1, 
    }

    return {
        addItem: function(type,des,val)
        {
            var newItem,ID;
            //Create new ID
            if(data.allItems[type].length>0)
            ID = data.allItems[type][data.allItems[type].length-1].id+1;
            else
            ID = 0;
            //Create new item based on type 'inc' or 'exp' type
            if(type==='exp')
            newItem = new Expense(ID,des,val);
            else if(type==='inc')
            newItem = new Income(ID,des,val);
            //Push it into our data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },

        deleteItem: function(type,id)
        {
            var ids,index;
            ids = data.allItems[type].map(function(curr){
              return curr.id;//Map returns an array always
            });
            index = ids.indexOf(id);//we get the index of the id that we passed in the function
            if(index!==-1)
            {
                data.allItems[type].splice(index,1);
            }
        } ,

        calculateBudget: function()
        {
            //Calculate total income and expenses
            calculateTotal('exp');   
            calculateTotal('inc');   
            //Calculate the budget: income - expenses
            data.budget = data.total.inc - data.total.exp;
            //Calculate the percentage of income that we spent
            if(data.total.inc > 0)
            data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            else
            data.percentage = -1    ;
        },
        
        calculatePercentage: function()
        {
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.total.inc);
            });
        },

        getPercentages: function()
        {
            var allPer = data.allItems.exp.map(function(curr){
                 return curr.getPercentage();    
            });
            return allPer;
        },

        getBudget: function()
        {
            return{
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage,
            };
        },
        testing: function()
        {
            console.log(data)            
        }

    };

})();


//UI Controller
var UIController = (function () {
    
   var domStrings = {
       inputType: '.add__type',
       inputDescription: '.add__description',
       inputValue: '.add__value',
       inputBtn: '.add__btn',
       incomeContainer: '.income__list',
       expensesContainer: '.expenses__list',
       budgetLabel: '.budget__value',
       incomeLabel: '.budget__income--value',
       expensesLabel: '.budget__expenses--value',
       percentageLabel: '.budget__expenses--percentage',
       container: '.container',
       expPerLabel: '.item__percentage',
       dateLabel: '.budget__title--month',
   }
   
   var formatNumber = function(num,type)
   {
       var numSplit,int,dec;
       num = Math.abs(num);
       num = num.toFixed(2);
       numSplit = num.split('.');
       int = numSplit[0];
       if(int.length>3)
       int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
       dec = numSplit[1];
       return (type==='exp'?'-':'+')+' '+int+'.'+dec;
   };
   var nodeListForeach = function(list,callback)
   {
       for(var i=0;i<list.length;i++)
       {
           callback(list[i],i);
       }
   };

   return {
       getInput: function()
       {
           return {
               type: document.querySelector(domStrings.inputType).value,//Will be either inc or exp
               description: document.querySelector(domStrings.inputDescription).value,
               value: parseFloat(document.querySelector(domStrings.inputValue).value),
           };
       },
       addListItem: function(obj,type)
       {
            var html,newHtml,element;
            //Create HTML with placeholder text 
            if(type==='inc')
            {
               element = domStrings.incomeContainer; 
               html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type==='exp')
            {
               element = domStrings.expensesContainer; 
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'  
            }
            //Replace the placeholder text eith actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
       },
       deleteListItem: function(selectorId)
       {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
       },
       clearFields: function()
       {
           var fields,fieldsArr;
           fields = document.querySelectorAll(domStrings.inputDescription+', '+domStrings.inputValue);
           //Since the querySelectorAll returns a list and not an array so we have to convert the list into the Array
           fieldsArr = Array.prototype.slice.call(fields)
           fieldsArr.forEach(curr => {
               curr.value = "";
           }); 
           fieldsArr[0].focus();
       },
       displayBudget: function(obj)
       {
           var type;
           obj.budget>=0? type = 'inc':type = 'exp';
           document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
           document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
           document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
           if(obj.percentage>0)
           document.querySelector(domStrings.percentageLabel).textContent = obj.percentage+'%';
           else  
           document.querySelector(domStrings.percentageLabel).textContent = '---'; 
       },
       displayPercentages: function(percentage)
       {
           var fields = document.querySelectorAll(domStrings.expPerLabel);
         
           nodeListForeach(fields,function(curr,i){
               if(percentage[i]>0)
               curr.textContent = percentage[i]+'%';
               else
               curr.textContent = '---';
           });
       },
       displayMonth: function()
       {
           var now,year,month,months;
           now = new Date();
           months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
           month = now.getMonth();
           year = now.getFullYear();
           document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
       },
       changedType: function()
       {
           var fields = document.querySelectorAll(domStrings.inputType+','+domStrings.inputDescription+','+domStrings.inputValue);
           nodeListForeach(fields,function(cur){
              cur.classList.toggle('red-focus');
           });
           document.querySelector(domStrings.inputBtn).classList.toggle('red');
       },
       getdomStrings: function()
       {
           return domStrings;
       }
   };

})();


//Global App Controller
var controller = (function(budgetCtrl,UICtrl)
{
    
    var setEventListeners = function()
    {
        var DOM = UICtrl.getdomStrings(); 
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function() {
        if(event.keyCode === 13 || event.which === 13)
        ctrlAddItem();
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }
    var updateBudget = function() {

       // 1. Calculate the budget
       budgetCtrl.calculateBudget();
       // 2.Return the Budget
       var budget = budgetCtrl.getBudget();
       // 3. Display the budget on the UI
       UICtrl.displayBudget(budget);   

    }

    var updatePercentage = function(){

        //1. Calculate the percentage
        budgetCtrl.calculatePercentage();
        //2. Read Percentage from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //3. Update the UI with the new Percentage
        UICtrl.displayPercentages(percentages);       
    } 

    var ctrlAddItem = function() {
          
        var input,newItem;
        //1. Get the field input data
        input = UICtrl.getInput(); 
        if(input.description !=="" && !isNaN(input.value) && input.value>0)
        {
           //2. Add the item to the budget controller
           newItem = budgetCtrl.addItem(input.type,input.description,input.value);
           //3. Add the item to the UI
           UICtrl.addListItem(newItem,input.type);
           //4.Clear the fields
           UICtrl.clearFields();
           //5.Calculate and Update the budget
           updateBudget();   
           //4. Update the Percentage
           updatePercentage();
        }
    }
    var ctrlDeleteItem = function(event)
    {
        var itemId,slitId,type,ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        if(itemId)
        {
          splitId = itemId.split('-');//It will return array of inc-1 as {'inc','1'}
          type = splitId[0];
          ID = parseInt(splitId[1]);

          //1. delete the item from the data structure
          budgetCtrl.deleteItem(type,ID);
          //2. delete the item from the UI
          UICtrl.deleteListItem(itemId);
          //3. Update and show the new budget
          updateBudget();
          //4. Update the Percentage
          updatePercentage();
        }    
    }
    
    return {
         init: function()
        {
            setEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });  
        }
    }

})(budgetController,UIController);

controller.init(); 