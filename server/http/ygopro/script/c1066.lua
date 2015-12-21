--コアキメイル·ビートル
function c1066.initial_effect(c)
	--cost
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_CANNOT_DISABLE)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c1066.mtcon)
	e1:SetOperation(c1066.mtop)
	c:RegisterEffect(e1)
	--poschange
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(1066,3))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c1066.target)
	e2:SetOperation(c1066.operation)
	c:RegisterEffect(e2)
end
function c1066.mtcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c1066.cfilter1(c)
	return c:IsCode(36623431) and c:IsAbleToGraveAsCost()
end
function c1066.cfilter2(c)
	return c:IsType(TYPE_MONSTER) and not c:IsPublic()
end
function c1066.mtop(e,tp,eg,ep,ev,re,r,rp)
	local g1=Duel.GetMatchingGroup(c1066.cfilter1,tp,LOCATION_HAND,0,nil)
	local g2=Duel.GetMatchingGroup(c1066.cfilter2,tp,LOCATION_HAND,0,nil)
	local select=2
	if g1:GetCount()>0 and g2:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(1066,0),aux.Stringid(1066,1),aux.Stringid(1066,2))
	elseif g1:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(1066,0),aux.Stringid(1066,2))
		if select==1 then select=2 end
	elseif g2:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(1066,1),aux.Stringid(1066,2))
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
function c1066.filter(c,e)
	return c:IsPosition(POS_FACEUP_ATTACK) and c:IsAttribute(ATTRIBUTE_LIGHT+ATTRIBUTE_DARK)
		and (not e or c:IsRelateToEffect(e))
end
function c1066.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c1066.filter,1,nil) end
	Duel.SetTargetCard(eg)
end
function c1066.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=eg:Filter(c1066.filter,nil,e)
	Duel.ChangePosition(g,POS_FACEUP_DEFENCE)
end
