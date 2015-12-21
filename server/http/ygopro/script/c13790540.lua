--Aroma Garden
function c13790540.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--LP Up 1
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(1353770,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_FZONE)
	e1:SetCondition(c13790540.condition)
	e1:SetTarget(c13790540.target)
	e1:SetOperation(c13790540.operation)
	c:RegisterEffect(e1)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e1:SetRange(LOCATION_FZONE)
	e1:SetProperty(EFFECT_FLAG_CHAIN_UNIQUE)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetCondition(c13790540.condition2)
	e1:SetTarget(c13790540.target2)
	e1:SetOperation(c13790540.operation2)
	c:RegisterEffect(e1)
end
function c13790540.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingTarget(Card.IsSetCard,tp,LOCATION_MZONE,0,1,nil,0xc8)
end
function c13790540.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(500)
	Duel.SetOperationInfo(0,CATEGORY_RECOVER,nil,0,tp,500)
end
function c13790540.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	if Duel.Recover(p,d,REASON_EFFECT) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetTargetRange(LOCATION_MZONE,0)
		e1:SetTarget(c13790540.atktg)
		e1:SetValue(500)
		e1:SetReset(RESET_PHASE+RESET_END,2)
		Duel.RegisterEffect(e1,tp)
		local e2=e1:Clone()
		e2:SetCode(EFFECT_UPDATE_DEFENCE)
		Duel.RegisterEffect(e2,tp)
	end
end
function c13790540.atktg(e,c)
	return c:IsFaceup()
end

function c13790540.cfilter(c,tp)
	return c:IsType(TYPE_MONSTER) and c:IsSetCard(0xc8) and c:GetPreviousControler()==tp and c:IsPreviousLocation(LOCATION_MZONE)
end
function c13790540.condition2(e,tp,eg,ep,ev,re,r,rp)
	return not eg:IsContains(e:GetHandler()) and eg:IsExists(c13790540.cfilter,1,nil,tp) and bit.band(r,REASON_DESTROY)~=0
end
function c13790540.target2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(1000)
	Duel.SetOperationInfo(0,CATEGORY_RECOVER,nil,0,tp,1000)
end
function c13790540.operation2(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Recover(p,d,REASON_EFFECT)
end

