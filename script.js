document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const gradeCategorySelect = document.getElementById('grade-category');
    const gradeScoreInput = document.getElementById('grade-score');
    const gradeMaxInput = document.getElementById('grade-max');
    const addGradeBtn = document.getElementById('add-grade-btn');
    const updateGradeBtn = document.getElementById('update-grade-btn');
    const clearBtn = document.getElementById('clear-btn');
    const searchStudentInput = document.getElementById('search-student');
    const studentList = document.getElementById('student-list');
    const gradesBody = document.getElementById('grades-body');
    const midtermBtn = document.getElementById('midterm-btn');
    const finaltermBtn = document.getElementById('finalterm-btn');
    const gradesTitle = document.getElementById('grades-title');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const viewOverallBtn = document.getElementById('view-overall-btn');
    const overallModal = document.getElementById('overall-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const overallGradesBody = document.getElementById('overall-grades-body');
    const printOverallBtn = document.getElementById('print-overall-btn');

    // Grade summary elements
    const quizGradeEl = document.getElementById('quiz-grade');
    const quizEquivalentEl = document.getElementById('quiz-equivalent');
    const activitiesGradeEl = document.getElementById('activities-grade');
    const activitiesEquivalentEl = document.getElementById('activities-equivalent');
    const examsGradeEl = document.getElementById('exams-grade');
    const examsEquivalentEl = document.getElementById('exams-equivalent');
    const projectGradeEl = document.getElementById('project-grade');
    const projectEquivalentEl = document.getElementById('project-equivalent');
    const assignmentsGradeEl = document.getElementById('assignments-grade');
    const assignmentsEquivalentEl = document.getElementById('assignments-equivalent');
    const recitationGradeEl = document.getElementById('recitation-grade');
    const recitationEquivalentEl = document.getElementById('recitation-equivalent');
    const characterGradeEl = document.getElementById('character-grade');
    const characterEquivalentEl = document.getElementById('character-equivalent');
    const attendanceGradeEl = document.getElementById('attendance-grade');
    const attendanceEquivalentEl = document.getElementById('attendance-equivalent');
    const finalGradeEl = document.getElementById('final-grade');
    const finalEquivalentEl = document.getElementById('final-equivalent');
    const termDisplayEl = document.querySelector('.final-grade-card h3');

    // State variables
    let currentTerm = 'midterm';
    let currentStudentId = null;
    let currentCategoryFilter = 'all';
    let currentEditGradeId = null;
    let students = JSON.parse(localStorage.getItem('students')) || [];
    let grades = JSON.parse(localStorage.getItem('grades')) || [];

    // Initialize the app
    init();

    // Event Listeners
    addGradeBtn.addEventListener('click', addGrade);
    updateGradeBtn.addEventListener('click', updateGrade);
    clearBtn.addEventListener('click', clearForm);
    searchStudentInput.addEventListener('input', filterStudents);
    midtermBtn.addEventListener('click', () => switchTerm('midterm'));
    finaltermBtn.addEventListener('click', () => switchTerm('finalterm'));
    viewOverallBtn.addEventListener('click', showOverallGrades);
    closeModalBtn.addEventListener('click', () => overallModal.style.display = 'none');
    printOverallBtn.addEventListener('click', printOverallGrades);

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategoryFilter = btn.dataset.category;
            displayGrades();
        });
    });

    // Functions
    function init() {
        renderStudentList();
        displayGrades();
        updateGradeSummary();
    }

    function renderStudentList() {
        studentList.innerHTML = '';
        students.forEach(student => {
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            if (student.id === currentStudentId) {
                studentItem.classList.add('active');
            }
            studentItem.innerHTML = `
                <strong>${student.id}</strong> - ${student.name}
            `;
            studentItem.addEventListener('click', () => selectStudent(student.id));
            studentList.appendChild(studentItem);
        });
    }

    function filterStudents() {
        const searchTerm = searchStudentInput.value.toLowerCase();
        const studentItems = document.querySelectorAll('.student-item');

        studentItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function selectStudent(studentId) {
        currentStudentId = studentId;
        const student = students.find(s => s.id === studentId);
        if (student) {
            studentIdInput.value = student.id;
            studentNameInput.value = student.name;
        }
        renderStudentList();
        displayGrades();
        updateGradeSummary();
    }

    function addGrade() {
        const studentId = studentIdInput.value.trim();
        const studentName = studentNameInput.value.trim();
        const category = gradeCategorySelect.value;
        const score = parseFloat(gradeScoreInput.value);
        const maxScore = parseFloat(gradeMaxInput.value);

        if (!studentId || !studentName || !category || isNaN(score) || isNaN(maxScore)) {
            alert('Please fill in all fields with valid values');
            return;
        }

        // Add student if not exists
        if (!students.some(s => s.id === studentId)) {
            students.push({ id: studentId, name: studentName });
            localStorage.setItem('students', JSON.stringify(students));
        }

        // Add grade
        const newGrade = {
            id: Date.now().toString(),
            studentId,
            term: currentTerm,
            category,
            score,
            maxScore,
            percentage: (score / maxScore) * 100,
            date: new Date().toISOString()
        };

        grades.push(newGrade);
        localStorage.setItem('grades', JSON.stringify(grades));

        if (currentStudentId !== studentId) {
            currentStudentId = studentId;
            renderStudentList();
        }

        displayGrades();
        updateGradeSummary();
        clearForm();
    }

    function updateGrade() {
        if (!currentEditGradeId) return;

        const studentId = studentIdInput.value.trim();
        const studentName = studentNameInput.value.trim();
        const category = gradeCategorySelect.value;
        const score = parseFloat(gradeScoreInput.value);
        const maxScore = parseFloat(gradeMaxInput.value);

        if (!studentId || !studentName || !category || isNaN(score) || isNaN(maxScore)) {
            alert('Please fill in all fields with valid values');
            return;
        }

        const gradeIndex = grades.findIndex(g => g.id === currentEditGradeId);
        if (gradeIndex !== -1) {
            grades[gradeIndex] = {
                ...grades[gradeIndex],
                studentId,
                category,
                score,
                maxScore,
                percentage: (score / maxScore) * 100
            };

            localStorage.setItem('grades', JSON.stringify(grades));

            // Update student name if changed
            const studentIndex = students.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
                students[studentIndex].name = studentName;
                localStorage.setItem('students', JSON.stringify(students));
            }

            displayGrades();
            updateGradeSummary();
            clearForm();
        }
    }

    function editGrade(gradeId) {
        const grade = grades.find(g => g.id === gradeId);
        if (grade) {
            const student = students.find(s => s.id === grade.studentId);
            if (student) {
                studentIdInput.value = student.id;
                studentNameInput.value = student.name;
            }
            gradeCategorySelect.value = grade.category;
            gradeScoreInput.value = grade.score;
            gradeMaxInput.value = grade.maxScore;

            currentEditGradeId = gradeId;
            addGradeBtn.disabled = true;
            updateGradeBtn.disabled = false;
        }
    }

    function deleteGrade(gradeId) {
        if (confirm('Are you sure you want to delete this grade?')) {
            grades = grades.filter(g => g.id !== gradeId);
            localStorage.setItem('grades', JSON.stringify(grades));
            displayGrades();
            updateGradeSummary();

            if (currentEditGradeId === gradeId) {
                clearForm();
            }
        }
    }

    function clearForm() {
        studentIdInput.value = currentStudentId || '';
        if (currentStudentId) {
            const student = students.find(s => s.id === currentStudentId);
            studentNameInput.value = student ? student.name : '';
        } else {
            studentNameInput.value = '';
        }
        gradeCategorySelect.value = '';
        gradeScoreInput.value = '';
        gradeMaxInput.value = '';

        currentEditGradeId = null;
        addGradeBtn.disabled = false;
        updateGradeBtn.disabled = true;
    }

    function displayGrades() {
        gradesBody.innerHTML = '';

        if (!currentStudentId) {
            return;
        }

        const studentGrades = grades.filter(g =>
            g.studentId === currentStudentId &&
            g.term === currentTerm &&
            (currentCategoryFilter === 'all' || g.category === currentCategoryFilter)
        );

        if (studentGrades.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align: center;">No grades found for this student in the current term and category</td>`;
            gradesBody.appendChild(row);
            return;
        }

        studentGrades.forEach(grade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatCategoryName(grade.category)}</td>
                <td>${grade.score}</td>
                <td>${grade.maxScore}</td>
                <td>${grade.percentage.toFixed(2)}%</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${grade.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${grade.id}">Delete</button>
                </td>
            `;
            gradesBody.appendChild(row);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editGrade(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteGrade(btn.dataset.id));
        });
    }

    function formatCategoryName(category) {
        const names = {
            'quiz': 'Quiz',
            'activities': 'Activities',
            'major-exams': 'Major Exams',
            'project': 'Project',
            'assignments': 'Assignments',
            'recitation': 'Recitation',
            'character': 'Character',
            'attendance': 'Attendance'
        };
        return names[category] || category;
    }

    function switchTerm(term) {
        currentTerm = term;
        midtermBtn.classList.toggle('active', term === 'midterm');
        finaltermBtn.classList.toggle('active', term === 'finalterm');
        gradesTitle.textContent = term === 'midterm' ? 'Midterm Grades' : 'Final Term Grades';
        termDisplayEl.textContent = term === 'midterm' ? 'Midterm Grade' : 'Final Term Grade';
        displayGrades();
        updateGradeSummary();
    }

    function updateGradeSummary() {
        if (!currentStudentId) {
            resetGradeSummary();
            return;
        }

        const studentGrades = grades.filter(g => g.studentId === currentStudentId && g.term === currentTerm);

        // Calculate averages for each category
        const categories = {
            quiz: { scores: [], maxScores: [] },
            activities: { scores: [], maxScores: [] },
            'major-exams': { scores: [], maxScores: [] },
            project: { scores: [], maxScores: [] },
            assignments: { scores: [], maxScores: [] },
            recitation: { scores: [], maxScores: [] },
            character: { scores: [], maxScores: [] },
            attendance: { scores: [], maxScores: [] }
        };

        studentGrades.forEach(grade => {
            if (categories[grade.category]) {
                categories[grade.category].scores.push(grade.score);
                categories[grade.category].maxScores.push(grade.maxScore);
            }
        });

        // Calculate category averages and equivalents
        let finalGrade = 0;
        let totalWeight = 0;

        // Quiz (20%)
        if (categories.quiz.scores.length > 0) {
            const totalScore = categories.quiz.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.quiz.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            quizGradeEl.textContent = average.toFixed(2);
            quizEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.20;
            totalWeight += 0.20;
        } else {
            quizGradeEl.textContent = '0.00';
            quizEquivalentEl.textContent = '-';
        }

        // Activities (20%)
        if (categories.activities.scores.length > 0) {
            const totalScore = categories.activities.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.activities.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            activitiesGradeEl.textContent = average.toFixed(2);
            activitiesEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.20;
            totalWeight += 0.20;
        } else {
            activitiesGradeEl.textContent = '0.00';
            activitiesEquivalentEl.textContent = '-';
        }

        // Major Exams (20%)
        if (categories['major-exams'].scores.length > 0) {
            const totalScore = categories['major-exams'].scores.reduce((a, b) => a + b, 0);
            const totalMax = categories['major-exams'].maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            examsGradeEl.textContent = average.toFixed(2);
            examsEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.20;
            totalWeight += 0.20;
        } else {
            examsGradeEl.textContent = '0.00';
            examsEquivalentEl.textContent = '-';
        }

        // Project (15%)
        if (categories.project.scores.length > 0) {
            const totalScore = categories.project.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.project.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            projectGradeEl.textContent = average.toFixed(2);
            projectEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.15;
            totalWeight += 0.15;
        } else {
            projectGradeEl.textContent = '0.00';
            projectEquivalentEl.textContent = '-';
        }

        // Assignments (10%)
        if (categories.assignments.scores.length > 0) {
            const totalScore = categories.assignments.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.assignments.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            assignmentsGradeEl.textContent = average.toFixed(2);
            assignmentsEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.10;
            totalWeight += 0.10;
        } else {
            assignmentsGradeEl.textContent = '0.00';
            assignmentsEquivalentEl.textContent = '-';
        }

        // Recitation (5%)
        if (categories.recitation.scores.length > 0) {
            const totalScore = categories.recitation.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.recitation.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            recitationGradeEl.textContent = average.toFixed(2);
            recitationEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.05;
            totalWeight += 0.05;
        } else {
            recitationGradeEl.textContent = '0.00';
            recitationEquivalentEl.textContent = '-';
        }

        // Character (5%)
        if (categories.character.scores.length > 0) {
            const totalScore = categories.character.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.character.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            characterGradeEl.textContent = average.toFixed(2);
            characterEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.05;
            totalWeight += 0.05;
        } else {
            characterGradeEl.textContent = '0.00';
            characterEquivalentEl.textContent = '-';
        }

        // Attendance (5%)
        if (categories.attendance.scores.length > 0) {
            const totalScore = categories.attendance.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.attendance.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            const equivalent = getEquivalent(average);
            attendanceGradeEl.textContent = average.toFixed(2);
            attendanceEquivalentEl.textContent = equivalent;
            finalGrade += average * 0.05;
            totalWeight += 0.05;
        } else {
            attendanceGradeEl.textContent = '0.00';
            attendanceEquivalentEl.textContent = '-';
        }

        // Calculate final grade (weighted average)
        if (totalWeight > 0) {
            finalGrade = finalGrade / totalWeight;
            const finalEquivalent = getEquivalent(finalGrade);
            finalGradeEl.textContent = finalGrade.toFixed(2);
            finalEquivalentEl.textContent = finalEquivalent;
        } else {
            finalGradeEl.textContent = '0.00';
            finalEquivalentEl.textContent = '-';
        }
    }

    function resetGradeSummary() {
        quizGradeEl.textContent = '0.00';
        quizEquivalentEl.textContent = '-';
        activitiesGradeEl.textContent = '0.00';
        activitiesEquivalentEl.textContent = '-';
        examsGradeEl.textContent = '0.00';
        examsEquivalentEl.textContent = '-';
        projectGradeEl.textContent = '0.00';
        projectEquivalentEl.textContent = '-';
        assignmentsGradeEl.textContent = '0.00';
        assignmentsEquivalentEl.textContent = '-';
        recitationGradeEl.textContent = '0.00';
        recitationEquivalentEl.textContent = '-';
        characterGradeEl.textContent = '0.00';
        characterEquivalentEl.textContent = '-';
        attendanceGradeEl.textContent = '0.00';
        attendanceEquivalentEl.textContent = '-';
        finalGradeEl.textContent = '0.00';
        finalEquivalentEl.textContent = '-';
    }

    function getEquivalent(percentage) {
        if (percentage >= 98) return '1.00';
        if (percentage >= 95) return '1.25';
        if (percentage >= 92) return '1.50';
        if (percentage >= 89) return '1.75';
        if (percentage >= 86) return '2.00';
        if (percentage >= 83) return '2.25';
        if (percentage >= 80) return '2.50';
        if (percentage >= 77) return '2.75';
        if (percentage >= 75) return '3.00';
        return '5.00';
    }

    function showOverallGrades() {
        overallGradesBody.innerHTML = '';

        const allStudents = [...students];

        // Calculate overall grades for each student
        allStudents.forEach(student => {
            const midtermGrades = grades.filter(g => g.studentId === student.id && g.term === 'midterm');
            const finaltermGrades = grades.filter(g => g.studentId === student.id && g.term === 'finalterm');

            const midtermGrade = calculateTermGrade(midtermGrades);
            const finaltermGrade = calculateTermGrade(finaltermGrades);
            const overallGrade = calculateOverallGrade(midtermGrade, finaltermGrade);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id} - ${student.name}</td>
                <td>${midtermGrade.toFixed(2)} (${getEquivalent(midtermGrade)})</td>
                <td>${finaltermGrade.toFixed(2)} (${getEquivalent(finaltermGrade)})</td>
                <td>${overallGrade.toFixed(2)} (${getEquivalent(overallGrade)})</td>
            `;
            overallGradesBody.appendChild(row);
        });

        overallModal.style.display = 'flex';
    }

    function calculateTermGrade(termGrades) {
        if (termGrades.length === 0) return 0;

        const categories = {
            quiz: { scores: [], maxScores: [] },
            activities: { scores: [], maxScores: [] },
            'major-exams': { scores: [], maxScores: [] },
            project: { scores: [], maxScores: [] },
            assignments: { scores: [], maxScores: [] },
            recitation: { scores: [], maxScores: [] },
            character: { scores: [], maxScores: [] },
            attendance: { scores: [], maxScores: [] }
        };

        termGrades.forEach(grade => {
            if (categories[grade.category]) {
                categories[grade.category].scores.push(grade.score);
                categories[grade.category].maxScores.push(grade.maxScore);
            }
        });

        let termGrade = 0;
        let totalWeight = 0;

        // Quiz (20%)
        if (categories.quiz.scores.length > 0) {
            const totalScore = categories.quiz.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.quiz.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.20;
            totalWeight += 0.20;
        }

        // Activities (20%)
        if (categories.activities.scores.length > 0) {
            const totalScore = categories.activities.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.activities.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.20;
            totalWeight += 0.20;
        }

        // Major Exams (20%)
        if (categories['major-exams'].scores.length > 0) {
            const totalScore = categories['major-exams'].scores.reduce((a, b) => a + b, 0);
            const totalMax = categories['major-exams'].maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.20;
            totalWeight += 0.20;
        }

        // Project (15%)
        if (categories.project.scores.length > 0) {
            const totalScore = categories.project.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.project.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.15;
            totalWeight += 0.15;
        }

        // Assignments (10%)
        if (categories.assignments.scores.length > 0) {
            const totalScore = categories.assignments.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.assignments.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.10;
            totalWeight += 0.10;
        }

        // Recitation (5%)
        if (categories.recitation.scores.length > 0) {
            const totalScore = categories.recitation.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.recitation.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.05;
            totalWeight += 0.05;
        }

        // Character (5%)
        if (categories.character.scores.length > 0) {
            const totalScore = categories.character.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.character.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.05;
            totalWeight += 0.05;
        }

        // Attendance (5%)
        if (categories.attendance.scores.length > 0) {
            const totalScore = categories.attendance.scores.reduce((a, b) => a + b, 0);
            const totalMax = categories.attendance.maxScores.reduce((a, b) => a + b, 0);
            const average = (totalScore / totalMax) * 100;
            termGrade += average * 0.05;
            totalWeight += 0.05;
        }

        return totalWeight > 0 ? termGrade / totalWeight : 0;
    }

    function calculateOverallGrade(midtermGrade, finaltermGrade) {
        return (midtermGrade * 0.4) + (finaltermGrade * 0.6);
    }

    function printOverallGrades() {
        window.print();
    }
});