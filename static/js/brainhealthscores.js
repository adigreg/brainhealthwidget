export function getSeverity(field, rawValue) {
    rawValue = parseFloat(rawValue);
    
    switch (field) {
        case "Systolic":
            return getSystolicSeverity(rawValue);
        case "Diastolic":
            return getDiastolicSeverity(rawValue);
        case "A1c":
            return getBloodSugarSeverity(rawValue);
        case "Cholesterol":
            return getCholesterolSeverity(rawValue);
        case "BMI":
            return getBmiSeverity(rawValue);
        case "EtOH":
            return getAlcoholSeverity(rawValue);
        case "physical activity/athletics":
            return getActivitySeverity(rawValue);
        case "diet score":
            return getDietScoreSeverity(rawValue);
        case "Smoking":
            return getSmokingSeverity(rawValue);
        case "Sleep":
            return getSleepSeverity(rawValue);
        default:
            if (rawValue > 80) {
                return 0.6;
            } else if (rawValue > 40) {
                return 0.4;
            } else {
                return 0.2;
            }
    }
}

function getDiastolicSeverity(value) {
    if (value > 120) {
        return 0.8;
    } else if (value > 90) {
        return 0.6;
    } else if (value > 80) {
        return 0.4;
    } else {
        return 0.2;
    }
}

function getSystolicSeverity(value) {
    if (value > 180) {
        return 0.8;
    } else if (value > 140) {
        return 0.6;
    } else if (value > 130) {
        return 0.5;
    } else if (value > 120) {
        return 0.4;
    } else {
        return 0.2;
    }
}

function getBloodSugarSeverity(value) {
    if (value > 6.4) {
        return 0.8;
    } else if (value > 5.7) {
        return 0.6;
    } else {
        return 0.2;
    }
}

function getCholesterolSeverity(value) {
    if (value > 190) {
        return 0.6;
    } else {
        return 0.2;
    }
}

function getBmiSeverity(value) {
    if (value > 30) {
        return 0.6;
    } else if (value > 25 || value < 18.5) {
        return 0.4;
    } else {
        return 0.2;
    }
}

function getDietScoreSeverity(value) {
    if (value === 0) {
        return 0.6;
    } else if (value === 1) {
        return 0.4;
    } else if (value === 2) {
        return 0.2;
    }
}

function getAlcoholSeverity(value) {
    if (value >= 4) {
        return 0.6;
    } else if (value === 2 || value === 3) {
        return 0.4;
    } else if (value <= 1) {
        return 0.2;
    }
}

function getSmokingSeverity(value) {
    if (value === 1) {
        return 0.6;
    } else if (value > 1) {
        return 0.2;
    }
}

function getActivitySeverity(value) {
    if (value < 150) {
        return 0.6;
    } else {
        return 0.2;
    }
}

function getSleepSeverity(value) {
    if (value < 7) {
        return 0.6;
    } else if (value >= 8) {
        return 0.2;
    }
}

// class BrainHealthField {
//     constructor(brainHealthType,rawValue){
//         this.brainHealthType = brainHealthType
//         this.rawValue = rawValue
//         this.valueType = this.rawValue != null ? typeof this.rawValue : null
//     }


// }