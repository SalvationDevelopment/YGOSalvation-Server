--The Phantom Knights of Fragile Armor
function c36704180.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_HANDES+CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCountLimit(1,36704180)
	e1:SetCost(c36704180.tdcost)
	e1:SetTarget(c36704180.target)
	e1:SetOperation(c36704180.operation)
	c:RegisterEffect(e1)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_DAMAGE)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_DESTROYED)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e2:SetRange(LOCATION_HAND)
	e2:SetCountLimit(1,367041801)
	e2:SetCondition(c36704180.spcon1)
	e2:SetTarget(c36704180.sptg1)
	e2:SetOperation(c36704180.spop1)
	c:RegisterEffect(e2)
end
function c36704180.tdcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c36704180.filter(c)
	return (c:IsSetCard(0x1373) or (c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsSetCard(0x1374))) and c:IsAbleToGrave()
end
function c36704180.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1) and
	Duel.IsExistingMatchingCard(c36704180.filter,tp,LOCATION_HAND,0,1,e:GetHandler()) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(1)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
end
function c36704180.operation(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.DiscardHand(p,c36704180.filter,1,1,REASON_EFFECT+REASON_DISCARD)
	Duel.Draw(p,d,REASON_EFFECT)
end

function c36704180.cfilter(c,tp)
	return c:IsReason(REASON_BATTLE+REASON_EFFECT) and c:IsSetCard(0x1373)
		and c:IsPreviousLocation(LOCATION_MZONE) and c:IsPreviousPosition(POS_FACEUP) and c:GetPreviousControler()==tp
end
function c36704180.spcon1(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c36704180.cfilter,1,nil,tp)
end
function c36704180.sptg1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,0,0,tp,500)
end
function c36704180.spop1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)~=0 then
		Duel.BreakEffect()
	end
end
