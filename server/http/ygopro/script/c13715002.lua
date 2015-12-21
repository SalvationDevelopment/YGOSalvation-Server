--Ring of Peace
function c13715002.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_TO_HAND)
	e1:SetCondition(c13715002.regcon)
	e1:SetOperation(c13715002.regop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_ACTIVATE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetCondition(c13715002.condition)
	e2:SetTarget(c13715002.target)
	e2:SetOperation(c13715002.activate)
	c:RegisterEffect(e2)
end
function c13715002.regcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return Duel.GetCurrentPhase()==PHASE_DRAW and Duel.GetFieldGroupCount(tp,LOCATION_ONFIELD,0)==0
		and	Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)>2 and c:IsReason(REASON_DRAW) and c:IsReason(REASON_RULE)
end
function c13715002.regop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if Duel.SelectYesNo(tp,aux.Stringid(13715002,0)) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_PUBLIC)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_MAIN1)
		c:RegisterEffect(e1)
		c:RegisterFlagEffect(13715002,RESET_PHASE+PHASE_MAIN1,0,1)
	end
end
function c13715002.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1 and not Duel.CheckPhaseActivity() and e:GetHandler():GetFlagEffect(13715002)~=0
end
function c13715002.filter(c)
	return c:IsAbleToHand()
end
function c13715002.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13715002.filter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c13715002.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13715002.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
