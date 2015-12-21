--Crown of the Empress
function c511000030.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetCondition(c511000030.condition)
	e1:SetTarget(c511000030.target)
	e1:SetOperation(c511000030.activate)
	c:RegisterEffect(e1)
	--act in hand
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DRAW)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_HAND)
	e2:SetCondition(c511000030.handcon)
	e2:SetTarget(c511000030.target2)
	e2:SetOperation(c511000030.activate)
	c:RegisterEffect(e2)
end
function c511000030.cfilter2(c,tp)
	return c:IsType(TYPE_SYNCHRO) and c:IsControler(1-tp)
end
function c511000030.handcon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c511000030.cfilter2,1,nil,tp) and Duel.IsExistingMatchingCard(c511000030.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c511000030.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x4a)
end
function c511000030.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c511000030.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c511000030.gfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_SYNCHRO)
end
function c511000030.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local ct=Duel.GetMatchingGroupCount(c511000030.gfilter,tp,0,LOCATION_MZONE,nil)*2
		return ct>0 and Duel.IsPlayerCanDraw(tp,ct)
	end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(ct)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,ct)
end
function c511000030.activate(e,tp,eg,ep,ev,re,r,rp)
	local p=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER)
	local ct=Duel.GetMatchingGroupCount(c511000030.gfilter,tp,0,LOCATION_MZONE,nil)*2
	Duel.Draw(p,ct,REASON_EFFECT)
end
function c511000030.target2(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then
		local ct=Duel.GetMatchingGroupCount(c511000030.gfilter,tp,0,LOCATION_MZONE,nil)*2
		return ct>0 and Duel.IsPlayerCanDraw(tp,ct) and Duel.GetLocationCount(tp,LOCATION_SZONE)>0
	end
	e:SetType(EFFECT_TYPE_ACTIVATE)
	Duel.MoveToField(c,tp,tp,LOCATION_SZONE,POS_FACEUP,true)
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(ct)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,ct)
end

