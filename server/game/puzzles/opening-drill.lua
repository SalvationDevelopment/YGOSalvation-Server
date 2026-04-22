--[[message
Opening Drill

Loads directly into a scripted puzzle board and advances to Main Phase 1.
The goal of this starter slice is to verify puzzle-room boot, duel startup,
and the automatic transition into the player's first interactive turn.
]]
Debug.SetAIName("Training Bot")
Debug.ShowHint("Opening Drill")
Debug.ReloadFieldBegin(0,5)
Debug.SetPlayerInfo(0,4000,0,0)
Debug.SetPlayerInfo(1,4000,0,0)
Debug.AddCard(89631139,0,0,LOCATION_MZONE,2,POS_FACEUP_ATTACK)
Debug.AddCard(46986414,0,0,LOCATION_HAND,0,POS_FACEDOWN)
Debug.AddCard(74677422,0,0,LOCATION_SZONE,2,POS_FACEDOWN)
Debug.AddCard(46986414,0,0,LOCATION_DECK,0,POS_FACEDOWN)
Debug.AddCard(89631139,0,0,LOCATION_DECK,0,POS_FACEDOWN)
Debug.AddCard(70781052,1,1,LOCATION_MZONE,2,POS_FACEUP_ATTACK)
Debug.AddCard(53129443,1,1,LOCATION_HAND,0,POS_FACEDOWN)
Debug.ReloadFieldEnd()
Auxiliary.BeginPuzzle()
