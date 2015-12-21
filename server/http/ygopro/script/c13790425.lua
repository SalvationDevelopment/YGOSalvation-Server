--Rising Void
function c13790425.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--self destroy
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EFFECT_SELF_DESTROY)
	e2:SetCondition(c13790425.sdcon)
	c:RegisterEffect(e2)
	--ToHand
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCountLimit(1,13790425)
	e3:SetTarget(c13790425.target)
	e3:SetOperation(c13790425.activate)
	c:RegisterEffect(e3)
end
function c13790425.sdfilter(c)
	return not c:IsFaceup() or not c:IsSetCard(0xbb)
end
function c13790425.sdcon(e)
	return Duel.IsExistingMatchingCard(c13790425.sdfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c13790425.filter1(c)
	return c:IsSetCard(0xbb) and c:IsAbleToHand()
end
function c13790425.filter2(c)
	return c:IsSetCard(0xbb) and c:IsFaceup()
end
function c13790425.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local turnp=Duel.GetTurnPlayer()
	if chk==0 then return ((turnp~=tp and Duel.IsExistingMatchingCard(c13790425.filter2,tp,LOCATION_GRAVE,0,1,nil))
		or (turnp==tp and Duel.IsExistingMatchingCard(c13790425.filter1,tp,LOCATION_REMOVED,0,1,nil))) end
	if turnp==tp then
		Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_REMOVED)
	else
		Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_GRAVE)
	end
end
function c13790425.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not c:IsRelateToEffect(e) then return end
	local turnp=Duel.GetTurnPlayer()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	if turnp~=tp then
		local g=Duel.SelectMatchingCard(tp,c13790425.filter1,tp,LOCATION_GRAVE,0,1,1,nil)
		Duel.SendtoHand(g,nil,REASON_EFFECT)
	else
		local g=Duel.SelectMatchingCard(tp,c13790425.filter2,tp,LOCATION_REMOVED,0,1,1,nil)
		Duel.SendtoGrave(g,REASON_EFFECT+REASON_RETURN)
	end
end

