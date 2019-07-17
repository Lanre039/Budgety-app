// BUDGET CONTROLLER

var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // this calculate the percentage
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    };

    // this get the percentage
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;

            /*****
         0
         [200, 400, 100]
         sum = 0 + 200
         sum = 200 + 400
         sum = 600 + 100 = 700
         */
        });
        data.totals[type] = sum;

    }

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
        percentage: -1
    };
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // [1 2 3 4 5], next ID = 6
            // [1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push it into our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
                var ids, index;
            // id = 3
            // data.allItems[type][id];
              // ids = [1 2 4  8]
              // ids = 3

              ids = data.allItems[type].map(function(current) {
                  return current.id;
              });
              index = ids.indexOf(id);

              if (index !== -1) {
                  data.allItems[type].splice(index, 1);
              }
        },

        calculateBudget: function() {
            // calculate the total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           
            // Expense = 100 and income 200, we spent 50% = 100/200 = 0.5 * 100
        },

        calculatePercentages: function() {


            /***
             a = 20
             b = 10
             c = 40
             income = 100
             a = 20/100 = 20%
             b = 10/100 = 10%
             c = 40/100 = 40%
             */

             data.allItems.exp.forEach(function(cur) {
                 cur.calcPercentage(data.totals.inc);
             });
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();

// UI Controller
var UIController = (function() {
    var DOMStrings = {
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
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var formatNumber = function(num, type) {

        var numSplit, int, dec, type;
        /***
         + or - before number
         exactly 2 decimal points
         comma separating the thousands

         2310.2587 -> + 2,310.46
         2000 -> + 2,000.00
         */

        // abs removes the sign of the number
         num = Math.abs(num);
         // toFixed rounds numbers to decimals we pass as arguement
         num = num.toFixed(2);

         numSplit = num.split('.');
         int = numSplit[0];
         if (int.length > 3) {
             // create a substring here which allows us to select a part of a string
             int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 23510, output 23,510
         }

         dec = numSplit[1];
         
         return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }

    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // will return inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, element, newHtml;
            
            // create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } 
            
            // Replace the placeholder text with some actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', obj.value);

        // Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '---';
            }
        },

        displayPercentages: function(percentages) {
// fields is past into list while current and index are passed into callback function as arguement
            // console.log(document.querySelectorAll(event.target));
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '----';
                }
                
            });

        },

        displayMonth: function() {
            var now, months, month, year;
            now = new Date();
            // if we do not pass any arguement into Date, its automatically going to return the current date.
            // var christmas = new Date(2016, 11, 25);
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

        nodeListForEach(fields, function(cur) {
            cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },
    
        getDOMStrings: function() {
            return DOMStrings;
        }
    }
})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    

    var updateBudget = function() {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }
   
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        
        // 4. Clear field
        UICtrl.clearFields();
        
        // 5. Calculate and update budget 
        updateBudget();

        // 6. calculate and update the percentages
        updatePercentages();
        } 
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID;

        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item for th UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

        }
    }

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1});
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();