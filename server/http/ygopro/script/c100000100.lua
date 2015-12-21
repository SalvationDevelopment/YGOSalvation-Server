--Power Wall
    function c100000100.initial_effect(c)
        --Activate
        local e1=Effect.CreateEffect(c)
        e1:SetType(EFFECT_TYPE_ACTIVATE)
        e1:SetCode(EVENT_PRE_BATTLE_DAMAGE)
        e1:SetCondition(c100000100.condition)
        e1:SetOperation(c100000100.activate)
        c:RegisterEffect(e1)
    end
    function c100000100.condition(e,tp,eg,ep,ev,re,r,rp)
        return tp~=Duel.GetTurnPlayer() and Duel.GetAttackTarget()==nil and Duel.IsPlayerCanDiscardDeck(tp,1)
    end
    function c100000100.activate(e,tp,eg,ep,ev,re,r,rp)
        local lp=Duel.GetLP(tp)
        local atk=e:GetLabelObject():GetAttack()
        local maxc=lp>atk and atk or lp
        maxc=math.floor(maxc/100)*100
        local t={}
        local l=1
        for i=1,maxc/100 do
            t[i]=i*100
        end
        Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(100000100,0))
        local announce=Duel.AnnounceNumber(tp,table.unpack(t)) 
        local g1=Duel.GetDecktopGroup(tp,announce)
		Duel.DisableShuffleCheck()
		Duel.Remove(g1,POS_FACEUP,REASON_EFFECT)
        if Duel.GetBattleDamage(tp)>=announce*100 then
            Duel.ChangeBattleDamage(tp,Duel.GetBattleDamage(tp)-announce*100)
        else
            Duel.ChangeBattleDamage(tp,0)
        end
        e:GetHandler():SetHint(CHINT_NUMBER,announce)
        e:GetHandler():RegisterFlagEffect(100000100,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
    end

