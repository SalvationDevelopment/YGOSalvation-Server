--Void Dream
function c13790509.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--level
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CHANGE_LEVEL)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTargetRange(LOCATION_MZONE,0)
	e2:SetTarget(c13790509.lvtg)
	e2:SetValue(1)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EFFECT_CHANGE_DAMAGE)
	e3:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e3:SetTargetRange(0,1)
	e3:SetValue(c13790509.val)
	c:RegisterEffect(e3)
	--Activate
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCost(c78748366.cost)
	e4:SetTarget(c13790509.target)
	e4:SetOperation(c13790509.activate)
	c:RegisterEffect(e4)
end
function c13790509.lvtg(e,c)
	return c:IsSetCard(0xbb) and c:GetOriginalLevel()>=2
end
function c13790509.val(e,re,dam,r,rp,rc)
	if bit.band(r,REASON_BATTLE)~=0 and (rc and rc:IsSetCard(0xbb)) then
		return dam/2
	else return dam end
end

function c13790509.cfilter(c)
	return c:GetSummonLocation()==LOCATION_EXTRA
end
function c13790509.filter1(c,e)
	return c:IsCanBeFusionMaterial() and not c:IsImmuneToEffect(e)
	and ( (not c:IsHasEffect(EFFECT_TO_GRAVE_REDIRECT) and c:IsAbleToGrave()) or c:IsHasEffect(EFFECT_TO_GRAVE_REDIRECT) )
end
function c13790509.filter2(c,e,tp,m,f,chkf)
	return c:IsType(TYPE_FUSION) and c:IsSetCard(0xbb) and (not f or f(c))
		and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_FUSION,tp,false,false) and c:CheckFusionMaterial(m,nil,chkf)
end
function c13790509.cfilter(c)
	return c:GetSummonLocation()==LOCATION_EXTRA
end
function c13790509.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
	Duel.SendtoGrave(e:GetHandler(),REASON_COST)
		local chkf=Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and PLAYER_NONE or tp
		local mg1=Duel.GetMatchingGroup(c13790509.filter1,tp,LOCATION_HAND+LOCATION_MZONE,0,nil,e)
		if Duel.IsExistingMatchingCard(c13790509.cfilter,tp,0,LOCATION_MZONE,1,nil) and not 
		   Duel.IsExistingMatchingCard(c13790509.cfilter,tp,LOCATION_MZONE,0,1,nil) then
			local sg=Duel.GetMatchingGroup(c13790509.filter1,tp,LOCATION_DECK,0,nil,e)
			mg1:Merge(sg)
		end
		local res=Duel.IsExistingMatchingCard(c13790509.filter2,tp,LOCATION_EXTRA,0,1,nil,e,tp,mg1,nil,chkf)
		if not res then
			local ce=Duel.GetChainMaterial(tp)
			if ce~=nil then
				local fgroup=ce:GetTarget()
				local mg2=fgroup(ce,e,tp)
				local mf=ce:GetValue()
				res=Duel.IsExistingMatchingCard(c13790509.filter2,tp,LOCATION_EXTRA,0,1,nil,e,tp,mg2,mf,chkf)
			end
		end
		return res
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c13790509.activate(e,tp,eg,ep,ev,re,r,rp)
	local chkf=Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and PLAYER_NONE or tp
	local mg1=Duel.GetMatchingGroup(c13790509.filter1,tp,LOCATION_HAND+LOCATION_MZONE,0,nil,e)
	if Duel.IsExistingMatchingCard(c13790509.cfilter,tp,0,LOCATION_MZONE,1,nil) then
		local sg=Duel.GetMatchingGroup(c13790509.filter1,tp,LOCATION_DECK,0,nil,e)
		mg1:Merge(sg)
	end
	local sg1=Duel.GetMatchingGroup(c13790509.filter2,tp,LOCATION_EXTRA,0,nil,e,tp,mg1,nil,chkf)
	local mg2=nil
	local sg2=nil
	local ce=Duel.GetChainMaterial(tp)
	if ce~=nil then
		local fgroup=ce:GetTarget()
		mg2=fgroup(ce,e,tp)
		local mf=ce:GetValue()
		sg2=Duel.GetMatchingGroup(c13790509.filter2,tp,LOCATION_EXTRA,0,nil,e,tp,mg2,mf,chkf)
	end
	if sg1:GetCount()>0 or (sg2~=nil and sg2:GetCount()>0) then
		local sg=sg1:Clone()
		if sg2 then sg:Merge(sg2) end
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local tg=sg:Select(tp,1,1,nil)
		local tc=tg:GetFirst()
		if sg1:IsContains(tc) and (sg2==nil or not sg2:IsContains(tc) or not Duel.SelectYesNo(tp,ce:GetDescription())) then
			local mat1=Duel.SelectFusionMaterial(tp,tc,mg1,nil,chkf)
			tc:SetMaterial(mat1)
			Duel.SendtoGrave(mat1,REASON_EFFECT+REASON_MATERIAL+REASON_FUSION)
			Duel.BreakEffect()
			Duel.SpecialSummon(tc,SUMMON_TYPE_FUSION,tp,tp,false,false,POS_FACEUP)
		else
			local mat2=Duel.SelectFusionMaterial(tp,tc,mg2,nil,chkf)
			local fop=ce:GetOperation()
			fop(ce,e,tp,tc,mat2)
		end
		tc:CompleteProcedure()
	end
end
