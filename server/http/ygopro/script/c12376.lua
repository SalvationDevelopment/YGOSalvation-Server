--Smash Ace
function c12376.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c12376.target)
	e1:SetOperation(c12376.operation)
	c:RegisterEffect(e1)
end
function c12376.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,0,LOCATION_DECK)~=0 end
end
function c12376.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.ConfirmDecktop(tp,1)
	local g=Duel.GetDecktopGroup(tp,1)
	local tc=g:GetFirst()
	if not tc then return end
	if tc:IsType(TYPE_MONSTER) and tc:IsAbleToRemove() then
		Duel.Damage(1-tp,1000,REASON_EFFECT)
		Duel.Remove(g,POS_FACEUP,REASON_EFFECT)
		Duel.DisableShuffleCheck()
	else
		Duel.DisableShuffleCheck()
		Duel.SendtoGrave(tc,nil,REASON_EFFECT)
	end
end