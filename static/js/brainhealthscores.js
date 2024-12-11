class BrainHealthGraph {
    constructor(root){
        this.root = root
    }

    buildGraph(root){
        for(child in this.root.children){
            console.log(child.brainHealthType, " ",child.rawValue)
            this.dfs(child)
        }
    }
}

export class BrainHealthField {
    constructor(brainHealthType,rawValue,dataSource){
        this.brainHealthType = brainHealthType
        this.rawValue = rawValue
        this.severity = 0
        this.score = 0
        this.severity = 0.2
        this.dataSource = dataSource
        this.children = []
        this.setBrainHealthScoreAndSeverity()
    }

    setBrainHealthScoreAndSeverity() {
        switch (this.brainHealthType) {
            case "Blood Pressure":
                return this.setBloodPressureScoreAndSeverity(this.rawValue);
            case "Blood Sugar":
                return this.setBloodSugarScoreAndSeverity(this.rawValue);
            case "Cholesterol":
                return this.setCholesterolScoreAndSeverity(this.rawValue);
            case "BMI":
                return this.setBmiScoreAndSeverity(this.rawValue);
            case "EtOH":
                return this.setAlcoholScoreAndSeverity(this.rawValue);
            case "Sleep":
                return this.setSleepScoreAndSeverity(this.rawValue);
            case "Smoking":
                return this.setSmokingScoreAndSeverity(this.rawValue);
            case "Aerobic Activities":
                return this.setActivityScoreAndSeverity(this.rawValue);
            case "Nutrition":
                return this.setNutritionScoreAndSeverity(this.rawValue);
            case "Stress":
                return this.setStressScoreAndSeverity(this.rawValue);
            case "Social Relationships":
                return this.setSocialRelationshipsScoreAndSeverity(this.rawValue);
            case "Meaning in Life":
                return this.setMeaningInLifeScoreAndSeverity(this.rawValue);
            default:
                return this.rawValue;
        }
    }

    // Hours of sleep
    setSleepScoreAndSeverity(value) {
        if(value < 7){
            this.score = 0
            this.severity = 0.6
        }
        this.score = 1
        this.severity = 0.2
    }

    setSocialRelationshipsScoreAndSeverity(value) {
        this.score = value;
        if(value == 0){
            this.severity = 0.6
        } else if (value == 1){
            this.severity = 0.2
        }
    }

    // Has meaning in life?
    setMeaningInLifeScoreAndSeverity(value) {
        this.score = value;
        if(value == 1){
            this.severity = 0.2
        } else {
            this.severity = 0.6
        }
    }

    // Stress level
    setStressScoreAndSeverity(value) {
        this.score = value;
        if(value == 0){
            this.severity = 0.6
        } else if (value == 1){
            this.severity = 0.4
        } else {
            this.severity = 0.2
        }
    }

    setNutritionScoreAndSeverity(value) {
        this.score = value
        if(value == 0){
            this.severity = 0.6
        } else if (value == 1){
            this.severity = 0.4
        } else {
            this.severity = 0.2
        }
    }

    setActivityScoreAndSeverity(value) {
        if(value >= 150) {
            this.score = 0
            this.severity = 0.6
        }
        this.score = 1
        this.severity = 0.2
    }
    
    setBloodPressureScoreAndSeverity(value) {
        let splitValues = value.split('/')
        let systolic = splitValues[0]
        let diastolic = splitValues[1]
        if (systolic >= 140 || diastolic >= 90) {
            this.score = 0
            this.severity = 0.6
        } else if ((139 > systolic && systolic > 120) || (diastolic > 80 && 89 > diastolic)) {
            this.score = 2
            this.severity = 0.4
        } else if (systolic < 120 && diastolic < 80) {
            this.score = 3
            this.severity = 0.2
        }
        this.score = 0
        this.severity = 0.6
    }
    
    setBloodSugarScoreAndSeverity(value) {
        if (value > 6.4) {
            this.score = 0
            this.severity = 0.6
        } else if (value >= 5.7) {
            this.score = 1
            this.severity = 0.4
        } else if (value < 5.7){
            this.score = 2
            this.severity = 0.2
        }
    }
    
    setCholesterolScoreAndSeverity(value) {
        if (value > 190) {
            this.score = 0
            this.severity = 0.6
        } else {
            this.score = 1;
            this.severity = 0.2
        }
    }
    
    setBmiScoreAndSeverity(value) {
        if (value > 30) {
            this.score = 0
            this.severity = 0.6
        } else if (value > 25 || value < 18.5) {
            this.score = 1;
            this.severity = 0.4
        } else {
            this.score = 2;
            this.severity = 0.2
        }
    }
    
    setAlcoholScoreAndSeverity(value) {
        if (value >= 4) {
            this.score = 0
            this.severity = 0.6
        } else if (value === 2 || value === 3) {
            this.score = 1;
            this.severity = 0.4
        } else if (value <= 1) {
            this.score = 2;
            this.severity = 0.2
        }
    }
    
    setSmokingScoreAndSeverity(value) {
        if (value === 1) {
            this.score = 0
            this.severity = 0.6
        } else if (value > 1) {
            this.score = 1
            this.severity = 0.2
        }
    }
    


}