--Glare of the Black Cat
function c13720037.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c13720037.condition)
	e1:SetOperation(c13720037.activate)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCost(c13720037.atkcost)
	e2:SetTarget(c13720037.target)
	e2:SetOperation(c13720037.operation)
	c:RegisterEffect(e2)
end
function c13720037.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(Card.IsFacedown,tp,LOCATION_MZONE,0,2,nil) and Duel.GetCurrentPhase()==PHASE_BATTLE
end
function c13720037.activate(e,tp,eg,ep,ev,re,r,rp)
	if not Duel.IsExistingMatchingCard(Card.IsFacedown,tp,LOCATION_MZONE,0,2,nil) then return end
		Duel.SkipPhase(1-tp,PHASE_BATTLE,RESET_PHASE+PHASE_BATTLE,1)
end
function c13720037.atkcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end

function c13720037.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x1374) and c:IsCanTurnSet()
end
function c13720037.filter2(c)
	return c:IsFaceup() and c:IsCanTurnSet()
end
function c13720037.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c13720037.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13720037.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c13720037.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	if Duel.IsExistingTarget(c13720037.filter2,tp,LOCATION_MZONE,LOCATION_MZONE,1,g:GetFirst()) and Duel.SelectYesNo(tp,aux.Stringid(13720037,0)) then
	local g2=Duel.SelectTarget(tp,c13720037.filter2,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,g:GetFirst())
	g:Merge(g2)
	end
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c13720037.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc=g:Filter(Card.IsRelateToEffect,nil,e)
		Duel.ChangePosition(tc,POS_FACEDOWN_DEFENCE)
end
