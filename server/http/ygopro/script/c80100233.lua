--コアキメイル・オーバードーズ
function c80100233.initial_effect(c)
	--cost
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_CANNOT_DISABLE)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c80100233.mtcon)
	e1:SetOperation(c80100233.mtop)
	c:RegisterEffect(e1)
	--disable spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DISABLE_SUMMON+CATEGORY_DESTROY)
	e2:SetDescription(aux.Stringid(80100233,3))
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_SUMMON)
	e2:SetCondition(c80100233.condition)
	e2:SetCost(c80100233.cost)
	e2:SetTarget(c80100233.target)
	e2:SetOperation(c80100233.operation)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EVENT_FLIP_SUMMON)
	c:RegisterEffect(e3)
	local e4=e2:Clone()
	e4:SetCode(EVENT_SPSUMMON)
	c:RegisterEffect(e4)
end
function c80100233.mtcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c80100233.cfilter1(c)
	return c:IsCode(36623431) and c:IsAbleToGraveAsCost()
end
function c80100233.cfilter2(c)
	return c:IsType(TYPE_MONSTER) and c:IsRace(RACE_ROCK) and not c:IsPublic()
end
function c80100233.mtop(e,tp,eg,ep,ev,re,r,rp)
	local g1=Duel.GetMatchingGroup(c80100233.cfilter1,tp,LOCATION_HAND,0,nil)
	local g2=Duel.GetMatchingGroup(c80100233.cfilter2,tp,LOCATION_HAND,0,nil)
	local select=2
	Duel.Hint(HINT_SELECTMSG,tp,0)
	if g1:GetCount()>0 and g2:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(80100233,0),aux.Stringid(80100233,1),aux.Stringid(80100233,2))
	elseif g1:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(80100233,0),aux.Stringid(80100233,2))
		if select==1 then select=2 end
	elseif g2:GetCount()>0 then
		select=Duel.SelectOption(tp,aux.Stringid(80100233,1),aux.Stringid(80100233,2))
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
function c80100233.condition(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsStatus(STATUS_BATTLE_DESTROYED) and ep~=tp
		and Duel.GetCurrentChain()==0
end
function c80100233.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() end
	Duel.Release(e:GetHandler(),REASON_COST)
end
function c80100233.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DISABLE_SUMMON,eg,eg:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,eg:GetCount(),0,0)
end
function c80100233.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateSummon(eg)
	Duel.Destroy(eg,REASON_EFFECT)
end
