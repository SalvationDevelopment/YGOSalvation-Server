--エクシーズ・チェンジ・タクティクス
function c80500005.initial_effect(c)
	c:SetUniqueOnField(1,0,80500005)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--draw
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80500005,0))
	e2:SetCategory(CATEGORY_DRAW)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCost(c80500005.cost)
	e2:SetCondition(c80500005.con)
	e2:SetTarget(c80500005.tg)
	e2:SetOperation(c80500005.op)
	c:RegisterEffect(e2)
end
function c80500005.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,500) end
	Duel.PayLPCost(tp,500)
end
function c80500005.gfilter(c,tp)
	return c:IsSetCard(0x7f) and c:IsType(TYPE_XYZ) and c:IsControler(tp)
end
function c80500005.con(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c80500005.gfilter,1,nil,tp) and eg:GetFirst():GetSummonType()==SUMMON_TYPE_XYZ
end
function c80500005.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(1)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
end
function c80500005.op(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
end
