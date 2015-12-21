--Roulette Spider
function c13720104.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c13720104.condition)
	e1:SetOperation(c13720104.activate)
	c:RegisterEffect(e1)
end
function c13720104.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp~=Duel.GetTurnPlayer()
end
function c13720104.activate(e,tp,eg,ep,ev,re,r,rp)
	local cat=Duel.GetAttacker()
	local nat=Duel.GetMatchingGroup(Card.GetAttackableTarget,tp,LOCATION_MZONE,0,cat)
	local nat2=Duel.GetMatchingGroup(Card.GetAttackableTarget,tp,0,LOCATION_MZONE,nil)
	local atkm=Duel.GetAttacker()
	local dc=Duel.TossDice(tp,1)
	if dc==1 then Duel.SetLP(tp,Duel.GetLP(tp)/2) end
	if dc==2 then Duel.ChangeAttackTarget(nil) end
	if dc==3 and Duel.IsExistingTarget(Card.GetAttackableTarget,tp,LOCATION_MZONE,0,1,nil) then 	
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local nt=nat:Select(tp,1,1,nil)
			Duel.HintSelection(nt)
			Duel.BreakEffect()
			Duel.ChangeAttackTarget(nt:GetFirst())
	end
	if dc==4 and Duel.IsExistingTarget(Card.GetAttackableTarget,tp,0,LOCATION_MZONE,1,nil) then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local nt2=Duel.SelectTarget(tp,nil,tp,0,LOCATION_MZONE,1,1,Duel.GetAttacker())
			Duel.HintSelection(nt2)
			Duel.BreakEffect()
			Duel.ChangeAttackTarget(nt2:GetFirst())
	end
	if dc==5 and Duel.NegateAttack() then Duel.Damage(1-tp,atkm:GetAttack(),REASON_EFFECT)
		end
	if dc==6 then Duel.Destroy(atkm,REASON_EFFECT) end
end
