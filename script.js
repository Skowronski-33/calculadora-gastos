 let expenses = [];
        let categories = {
            alimentacao: { name: '🍽️ Alimentação', emoji: '🍽️' },
            transporte: { name: '🚗 Transporte', emoji: '🚗' },
            moradia: { name: '🏠 Moradia', emoji: '🏠' },
            saude: { name: '🏥 Saúde', emoji: '🏥' },
            lazer: { name: '🎮 Lazer', emoji: '🎮' },
            educacao: { name: '📚 Educação', emoji: '📚' },
            compras: { name: '🛍️ Compras', emoji: '🛍️' },
            outros: { name: '📦 Outros', emoji: '📦' }
        };

        // Gerar opções de meses dinamicamente
        function populateMonthSelect() {
            const monthSelect = document.getElementById('currentMonth');
            const months = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            
            // Limpar opções existentes
            monthSelect.innerHTML = '';
            
            // Gerar meses
            for (let i = 0; i < months.length; i++) {
                const option = document.createElement('option');
                const monthValue = String(i + 1).padStart(2, '0');
                option.value = monthValue;
                option.textContent = months[i];
                monthSelect.appendChild(option);
            }
        }

        // Gerar opções de anos dinamicamente
        function populateYearSelect() {
            const yearSelect = document.getElementById('currentYear');
            const currentYear = new Date().getFullYear();
            
            // Limpar opções existentes
            yearSelect.innerHTML = '';
            
            // Gerar anos de 2020 até 3 anos no futuro
            for (let year = 2020; year <= currentYear + 3; year++) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }
        }

        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            // Gerar opções de meses e anos dinamicamente
            populateMonthSelect();
            populateYearSelect();
            
            // Definir mês e ano atual
            const today = new Date();
            const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
            const currentYear = today.getFullYear();
            
            document.getElementById('currentMonth').value = currentMonth;
            document.getElementById('currentYear').value = currentYear;
            
            // Definir data atual
            document.getElementById('expenseDate').value = today.toISOString().slice(0, 10);
            
            // Carregar dados salvos
            loadData();
            
            // Adicionar event listeners
            document.getElementById('currentMonth').addEventListener('change', updateAll);
            document.getElementById('currentYear').addEventListener('change', updateAll);
            document.getElementById('monthlyIncome').addEventListener('input', updateAll);
            
            // Atualizar interface
            updateAll();
        });

        // Carregar dados do localStorage
        function loadData() {
            const savedExpenses = localStorage.getItem('expenses');
            const savedIncome = localStorage.getItem('monthlyIncome');
            
            if (savedExpenses) {
                expenses = JSON.parse(savedExpenses);
            }
            
            if (savedIncome) {
                document.getElementById('monthlyIncome').value = savedIncome;
            }
        }

        // Salvar dados no localStorage
        function saveData() {
            localStorage.setItem('expenses', JSON.stringify(expenses));
            localStorage.setItem('monthlyIncome', document.getElementById('monthlyIncome').value);
        }

        // Obter mês/ano atual selecionado
        function getCurrentMonthYear() {
            const month = document.getElementById('currentMonth').value;
            const year = document.getElementById('currentYear').value;
            return year + '-' + month;
        }

        // Adicionar gasto
        function addExpense() {
            const description = document.getElementById('expenseDescription').value.trim();
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const category = document.getElementById('expenseCategory').value;
            const date = document.getElementById('expenseDate').value;

            if (!description) {
                alert('Por favor, digite uma descrição para o gasto!');
                return;
            }

            if (!amount || amount <= 0) {
                alert('Por favor, digite um valor válido e maior que zero!');
                return;
            }

            if (!date) {
                alert('Por favor, selecione uma data!');
                return;
            }

            const expense = {
                id: Date.now(),
                description: description,
                amount: amount,
                category: category,
                date: date
            };

            expenses.push(expense);
            
            // Limpar formulário
            document.getElementById('expenseDescription').value = '';
            document.getElementById('expenseAmount').value = '';
            document.getElementById('expenseCategory').value = 'alimentacao';
            
            // Salvar e atualizar
            saveData();
            updateAll();
            
            // Feedback visual
            alert('Gasto adicionado com sucesso!');
        }

        // Remover gasto
        function removeExpense(id) {
            if (confirm('Tem certeza que deseja remover este gasto?')) {
                expenses = expenses.filter(function(expense) {
                    return expense.id !== id;
                });
                saveData();
                updateAll();
            }
        }

        // Obter gastos filtrados
        function getFilteredExpenses() {
            const currentMonthYear = getCurrentMonthYear();
            const categoryFilter = document.getElementById('categoryFilter').value;
            
            return expenses.filter(function(expense) {
                const expenseMonth = expense.date.slice(0, 7);
                const matchesMonth = expenseMonth === currentMonthYear;
                const matchesCategory = categoryFilter === 'todos' || expense.category === categoryFilter;
                return matchesMonth && matchesCategory;
            });
        }

        // Atualizar lista de gastos
        function updateExpenseList() {
            const expenseList = document.getElementById('expenseList');
            const filteredExpenses = getFilteredExpenses();
            
            if (filteredExpenses.length === 0) {
                expenseList.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">Nenhum gasto registrado neste período</p>';
                return;
            }

            let html = '';
            for (let i = 0; i < filteredExpenses.length; i++) {
                const expense = filteredExpenses[i];
                html += '<div class="expense-item">';
                html += '<div class="expense-info">';
                html += '<div class="expense-description">' + categories[expense.category].emoji + ' ' + expense.description + '</div>';
                html += '<div class="expense-details">' + categories[expense.category].name + ' • ' + formatDate(expense.date) + '</div>';
                html += '</div>';
                html += '<div class="expense-amount">R$ ' + expense.amount.toFixed(2) + '</div>';
                html += '<button class="btn btn-danger" onclick="removeExpense(' + expense.id + ')">🗑️</button>';
                html += '</div>';
            }
            expenseList.innerHTML = html;
        }

        // Atualizar resumo financeiro
        function updateFinancialSummary() {
            const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
            const filteredExpenses = getFilteredExpenses();
            let totalExpenses = 0;
            
            for (let i = 0; i < filteredExpenses.length; i++) {
                totalExpenses += filteredExpenses[i].amount;
            }
            
            const balance = monthlyIncome - totalExpenses;

            document.getElementById('incomeDisplay').textContent = 'R$ ' + monthlyIncome.toFixed(2);
            document.getElementById('expensesDisplay').textContent = 'R$ ' + totalExpenses.toFixed(2);
            document.getElementById('balanceDisplay').textContent = 'R$ ' + balance.toFixed(2);
            
            const balanceElement = document.getElementById('balanceDisplay');
            const statusElement = document.getElementById('statusIndicator');
            
            if (balance >= 0) {
                balanceElement.className = 'positive';
                statusElement.textContent = '✅ Você está economizando!';
                statusElement.className = 'status-indicator status-positive';
            } else {
                balanceElement.className = 'negative';
                statusElement.textContent = '⚠️ Atenção: gastos excedem a renda';
                statusElement.className = 'status-indicator status-negative';
            }
        }

        // Atualizar breakdown por categoria
        function updateCategoryBreakdown() {
            const filteredExpenses = getFilteredExpenses();
            let totalExpenses = 0;
            
            for (let i = 0; i < filteredExpenses.length; i++) {
                totalExpenses += filteredExpenses[i].amount;
            }
            
            const categoryTotals = {};
            const categoryKeys = Object.keys(categories);
            
            for (let i = 0; i < categoryKeys.length; i++) {
                const key = categoryKeys[i];
                categoryTotals[key] = {
                    total: 0,
                    percentage: 0
                };
            }

            for (let i = 0; i < filteredExpenses.length; i++) {
                const expense = filteredExpenses[i];
                categoryTotals[expense.category].total += expense.amount;
            }

            for (let i = 0; i < categoryKeys.length; i++) {
                const key = categoryKeys[i];
                if (totalExpenses > 0) {
                    categoryTotals[key].percentage = (categoryTotals[key].total / totalExpenses) * 100;
                }
            }

            const categoryBreakdown = document.getElementById('categoryBreakdown');
            
            const categoriesWithExpenses = [];
            for (let i = 0; i < categoryKeys.length; i++) {
                const key = categoryKeys[i];
                if (categoryTotals[key].total > 0) {
                    categoriesWithExpenses.push([key, categoryTotals[key]]);
                }
            }
            
            categoriesWithExpenses.sort(function(a, b) {
                return b[1].total - a[1].total;
            });

            if (categoriesWithExpenses.length === 0) {
                categoryBreakdown.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">Nenhum gasto registrado</p>';
                return;
            }

            let html = '';
            for (let i = 0; i < categoriesWithExpenses.length; i++) {
                const item = categoriesWithExpenses[i];
                const key = item[0];
                const data = item[1];
                
                html += '<div class="category-item">';
                html += '<div>';
                html += '<div>' + categories[key].name + '</div>';
                html += '<div style="font-size: 14px; color: #718096;">R$ ' + data.total.toFixed(2) + ' (' + data.percentage.toFixed(1) + '%)</div>';
                html += '<div class="category-bar">';
                html += '<div class="category-progress" style="width: ' + data.percentage + '%"></div>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            }
            categoryBreakdown.innerHTML = html;
        }

        // Atualizar tudo
        function updateAll() {
            updateExpenseList();
            updateFinancialSummary();
            updateCategoryBreakdown();
        }

        // Formatar data
        function formatDate(dateString) {
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('pt-BR');
        }