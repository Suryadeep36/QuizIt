package com.example.quizit.features.googleForm.helpers;

public class NumericValidator{
    public static boolean isInteger(String str) {
        try {
            Integer.parseInt(str); //
            return true;
        } catch (NumberFormatException e) { //
            return false;
        } catch (NullPointerException e) {
            return false;
        }
    }

    public static boolean isFloat(String str) {
        try {
            Float.parseFloat(str);
            if (str.contains(".")) {
                return true;
            } else {
                return false;
            }
        } catch (NumberFormatException e) {
            return false;
        } catch (NullPointerException e) {
            return false;
        }
    }
}