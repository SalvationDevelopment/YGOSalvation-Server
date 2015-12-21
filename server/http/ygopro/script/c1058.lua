--コアキメイル·デビル
function c1058.initial_effect(c)
	--cost
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_CANNOT_DISABLE)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c1058.mtcon)
	e1:SetOperation(c1058.mtop)
	c:RegisterEffect(e1)
	--disable
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_CHAIN_ACTIVATING)
	e2:SetOperation(c1058.disop)
	c:RegisterEffect(e2)
end
function c1058.mtcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c1058.cfilter1(c)
	return c:IsCode(36623431) and c:IsAbleToGraveAsCost()
end
function c1058.cfilter2(c)
	return c:IsType(TYPE_MONSTER) and not c:IsPublic()
end
function c1058.mtop(e,tp,eg,ep,ev,re,r,rp)
	local g1=Duel.GetMatchingGroup(c1058.cfilter1,tp,LOCATION_HAND,0,nil)
	local g2=Duel.GetMatchingGroup(c1058.cfilter2,tp,LOCATION_HAND,0,nil)
	local select=2
	Duel.Hint(HINT_SELECTMSG,tp,0)
	if g1:GetCount()>0 and g2:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(1058,0),aux.Stringid(1058,1),aux.Stringid(1058,2))
	elseif g1:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(1058,0),aux.Stringid(1058,2))
		if select==1 then select=2 end
	elseif g2:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(1058,1),aux.Stringid(1058,2))
		select=select+1
	end
	if select==0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local g=g1:Select(tp,1,1,nil)
		Duel.SendtoGrave(g,REASON_COST)
	elseif select==1 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONFIRM)
		local g=g2:Select(tp,1,1,nil)
		Duel.ConfirmCards(1-tp,g)
		Duel.ShuffleHand(tp)
	else
		Duel.Destroy(e:GetHandler(),REASON_RULE)
	end
end
function c1058.disop(e,tp,eg,ep,ev,re,r,rp)
	local ph=Duel.GetCurrentPhase()
	if (ph==PHASE_MAIN1 or ph==PHASE_MAIN2) and re:IsActiveType(TYPE_MONSTER)
		and re:GetHandler():IsAttribute(ATTRIBUTE_DARK+ATTRIBUTE_LIGHT) then
		Duel.NegateEffect(ev)
	end
end
