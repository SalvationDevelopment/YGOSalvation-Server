--Fusion Conscription
function c13790441.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790441)
	e1:SetTarget(c13790441.target)
	e1:SetOperation(c13790441.activate)
	c:RegisterEffect(e1)
end
function c13790441.filter1(c,tp)
	return c.material_count and Duel.IsExistingMatchingCard(c13790441.filter2,tp,LOCATION_DECK,0,1,nil,c)
end
function c13790441.filter2(c,fc)
	if c:IsHasEffect(EFFECT_FORBIDDEN) or not c:IsAbleToHand() then return false end
	for i=1,fc.material_count do
		if c:IsCode(fc.material[i]) then return true end
	end
	return false
end
function c13790441.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790441.filter1,tp,LOCATION_EXTRA,0,1,nil,tp) end
end
function c13790441.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONFIRM)
	local cg=Duel.SelectMatchingCard(tp,c13790441.filter1,tp,LOCATION_EXTRA,0,1,1,nil,tp)
	if cg:GetCount()==0 then return end
	Duel.ConfirmCards(1-tp,cg)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13790441.filter2,tp,LOCATION_DECK,0,1,1,nil,cg:GetFirst())
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
		local tc=g:GetFirst()
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
		e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
		e1:SetReset(RESET_PHASE+PHASE_END)
		e1:SetTargetRange(1,0)
		e1:SetTarget(c13790441.sumlimit)
		e1:SetLabel(tc:GetCode())
		Duel.RegisterEffect(e1,tp)
		local e2=e1:Clone()
		e2:SetCode(EFFECT_CANNOT_SUMMON)
		Duel.RegisterEffect(e2,tp)
		local e3=Effect.CreateEffect(e:GetHandler())
		e3:SetType(EFFECT_TYPE_FIELD)
		e3:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
		e3:SetCode(EFFECT_CANNOT_ACTIVATE)
		e3:SetReset(RESET_PHASE+PHASE_END)
		e3:SetTargetRange(1,0)
		e3:SetLabel(tc:GetCode())
		e3:SetValue(c13790441.aclimit)
		Duel.RegisterEffect(e3,tp)
	end
end
function c13790441.sumlimit(e,c)
	return c:IsCode(e:GetLabel())
end
function c13790441.aclimit(e,re,tp)
	return re:GetHandler():IsCode(e:GetLabel())
end

