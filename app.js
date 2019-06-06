//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }; //because there will be lots of expenses a function constructor will be the best way to do this!

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        });
        /* 
        0
        [200, 400, 100]
        sum = 0 + 200; - first iteration
        sum = 200 + 400; - next iteration
        sum = 600 + 100 = 700; - next iteration
        */
       data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        // percentage: -1 // use -1 when value does not exist yet
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //ID = 0;
            // ID = last ID + 1

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // id = 6
            // data.allItems[type][id] - can't do it this way beacuse the correct id may not always be selected
            // ids = [1, 2, 4, 6, 8]
            // index = 3

            ids = data.allItems[type].map(function(current) { //map is similar to forEach but returns a brand new array

               return current.id; 

            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spend
            // data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

        },
        getBudget: function(){
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp
          }  
        },

        testing: function(){
            console.log(data);
        }
    };

})();

//UI CONTROLLER
var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        container: '.container',
        dateLabel: '.budget__title--month'

    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        /*
        + or - before number
        exactly 2 decimal points comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 ->  + 2,000.00
        */

        num = Math.abs(num); // calculates absolute value of the number (-2000 becomes 2000)
        num = num.toFixed(2); // method of the number prototype - will add to decimal points to any num

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            // int = int.substr(0, 1) + ',' + int.substr(1, 3) - input: 2310; output: 2,310 - this poses problem when in tens of thousands - have to make it dynamic.
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); // input: 23510; output: 23,510 - Perfect!
        }

        dec = numSplit[1];

        //type === 'exp' ? sign = '-' : sign = '+';

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat function converts a string to a number.
            }; 
        },

        addListItem: function(obj, type) {

            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc'){

                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            } else if (type === 'exp') {

                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            }

            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM     
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); // 'beforeend' makes it so that all the html is inserted as a child of the containers as the last child aka. last element in the list.

        },

        deleteListItem: function(selectorID){

            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);

        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);//returns a list that needs to be converted to a loop which can then be looped over. 
            fieldsArr = Array.prototype.slice.call(fields); // tricks the return item into thinking its an array so that an array is returned. 

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        },
        
        displayMonth: function() {
            var now, year, months, month;

            now = new Date();
            //var christmas = new Date(2019, 11, 25);
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];

            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year; 

        },

        changedType: function(){

            // Have to select the 3 elements that recieve the red-focus class.
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
                nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
                });

            //Slect the button that will receive the red class
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {

                return DOMstrings; // exposes it to the public so it can be accessed outside this function.
            }
    };

})();


//GLOBAL APP CONTROLLER

//this will connect the budgetController with the UIController...they will be passed as arguements in the var controller.
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //5. Display the budget on the UI
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getInput();
        //console.log(input);
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. a). Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //b).Clear the input
            UICtrl.clearFields();

            //4. Calculate and update the budget
            updateBudget();
        }
        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); // will convert string to an integer (no decimals!)
        
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();
        }

    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0
            }  );
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();