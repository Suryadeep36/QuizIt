package com.example.quizit.records;

import java.util.concurrent.atomic.AtomicInteger;

public class ParticipantAntiCheatState {
    private final AtomicInteger tabSwitches = new AtomicInteger(0);
//    private volatile boolean blocked = false;

    public int increment(int limit){
        int val = tabSwitches.incrementAndGet();
        System.out.println("Increment tab switch for participant " + val);
//        if(val > limit){
//            blocked = true;
//        }
        return val;
    }

    public int getTabSwitches() {
        return tabSwitches.get();
    }

//    public boolean isBlocked() {
//        return blocked;
//    }
}
